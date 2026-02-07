import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(50).max(2000).optional(),
  fundingGoal: z.number().min(100).max(100000).optional(),
  deadline: z.string().transform((s) => new Date(s)).optional(),
  category: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().nullable(),
  gallery: z.array(z.string().url()).optional(),
  orgName: z.string().min(2).max(100).optional(),
  orgType: z.enum(["nonprofit", "school", "community_org", "small_business", "individual"]).optional(),
  ein: z.string().optional().nullable(),
  fundsCover: z.string().min(20).max(500).optional(),
  successMetrics: z.string().min(20).max(500).optional(),
  reportingPlan: z.string().min(20).max(500).optional(),
});

// GET /api/proposals/[id] - Get a single proposal
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.projectProposal.findUnique({
    where: { id },
    include: {
      proposer: { select: { id: true, name: true, email: true } },
      project: {
        select: { id: true, title: true, status: true, fundingRaised: true, fundingGoal: true },
      },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Only proposer or admin can view
  if (proposal.proposerId !== session.user.id && session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(proposal);
}

// PUT /api/proposals/[id] - Update a draft proposal
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.projectProposal.findUnique({
    where: { id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.proposerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (proposal.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft proposals can be edited" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.projectProposal.update({
      where: { id },
      data: {
        ...data,
        gallery: data.gallery ? JSON.stringify(data.gallery) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Error updating proposal:", error);
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 });
  }
}

// DELETE /api/proposals/[id] - Delete a draft proposal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposal = await prisma.projectProposal.findUnique({
    where: { id },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (proposal.proposerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (proposal.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft proposals can be deleted" },
      { status: 400 }
    );
  }

  await prisma.projectProposal.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
