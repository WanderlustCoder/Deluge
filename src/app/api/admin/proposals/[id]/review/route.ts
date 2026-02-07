import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes"]),
  notes: z.string().optional(),
});

// POST /api/admin/proposals/[id]/review - Approve or reject a proposal
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.projectProposal.findUnique({
    where: { id },
    include: { proposer: true },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.status !== "submitted" && proposal.status !== "in_review") {
    return NextResponse.json(
      { error: "Proposal is not in a reviewable state" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { action, notes } = reviewSchema.parse(body);

    if (action === "approve") {
      // Create the project from the proposal
      const project = await prisma.project.create({
        data: {
          title: proposal.title,
          description: proposal.description,
          category: proposal.category,
          fundingGoal: proposal.fundingGoal,
          location: proposal.location,
          imageUrl: proposal.imageUrl,
          status: "active",
        },
      });

      // Update the proposal
      await prisma.projectProposal.update({
        where: { id },
        data: {
          status: "approved",
          reviewerNotes: notes,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          projectId: project.id,
        },
      });

      // Notify the proposer
      await createNotification(
        proposal.proposerId,
        "proposal_approved",
        "Your project proposal was approved!",
        `"${proposal.title}" is now live and accepting funding.`,
        { projectId: project.id }
      );

      logAudit({
        adminId: session.user.id,
        adminEmail: session.user.email || "unknown",
        action: "proposal_approved",
        targetType: "proposal",
        targetId: id,
        details: JSON.stringify({ projectId: project.id, notes }),
      });

      return NextResponse.json({ success: true, projectId: project.id });
    } else if (action === "reject") {
      await prisma.projectProposal.update({
        where: { id },
        data: {
          status: "rejected",
          reviewerNotes: notes,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      await createNotification(
        proposal.proposerId,
        "proposal_rejected",
        "Your project proposal was not approved",
        notes || "Please review the feedback and consider resubmitting.",
        { proposalId: id }
      );

      logAudit({
        adminId: session.user.id,
        adminEmail: session.user.email || "unknown",
        action: "proposal_rejected",
        targetType: "proposal",
        targetId: id,
        details: notes,
      });

      return NextResponse.json({ success: true });
    } else if (action === "request_changes") {
      await prisma.projectProposal.update({
        where: { id },
        data: {
          status: "draft", // Back to draft for edits
          reviewerNotes: notes,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      await createNotification(
        proposal.proposerId,
        "proposal_changes_requested",
        "Changes requested for your proposal",
        notes || "Please review the feedback and resubmit.",
        { proposalId: id }
      );

      logAudit({
        adminId: session.user.id,
        adminEmail: session.user.email || "unknown",
        action: "proposal_changes_requested",
        targetType: "proposal",
        targetId: id,
        details: notes,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Error reviewing proposal:", error);
    return NextResponse.json({ error: "Failed to review proposal" }, { status: 500 });
  }
}
