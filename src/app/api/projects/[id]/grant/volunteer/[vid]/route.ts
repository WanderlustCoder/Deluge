import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// PATCH: update volunteer status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; vid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, vid } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!["completed", "verified", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const volunteer = await prisma.communityGrantVolunteer.findUnique({
      where: { id: vid },
      include: {
        grant: { include: { project: true } },
        user: { include: { watershed: true } },
      },
    });

    if (!volunteer || volunteer.grant.projectId !== id) {
      return NextResponse.json(
        { error: "Volunteer record not found" },
        { status: 404 }
      );
    }

    // User can mark themselves as completed or cancelled
    // Admin can verify
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountType: true },
    });

    const isAdmin = user?.accountType === "admin";
    const isOwner = volunteer.userId === session.user.id;

    if (status === "completed" && !isOwner) {
      return NextResponse.json(
        { error: "Only the volunteer can mark as completed" },
        { status: 403 }
      );
    }

    if (status === "verified" && !isAdmin) {
      return NextResponse.json(
        { error: "Only admins can verify completion" },
        { status: 403 }
      );
    }

    if (status === "cancelled" && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the volunteer or admin can cancel" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    if (status === "verified") {
      updateData.verifiedAt = new Date();
    }

    const updated = await prisma.communityGrantVolunteer.update({
      where: { id: vid },
      data: updateData,
    });

    // If verified, credit the volunteer's watershed
    if (status === "verified" && volunteer.user.watershed) {
      const newBalance =
        volunteer.user.watershed.balance + volunteer.grant.watershedCredit;

      await prisma.$transaction([
        prisma.watershed.update({
          where: { userId: volunteer.userId },
          data: {
            balance: newBalance,
            totalInflow: { increment: volunteer.grant.watershedCredit },
          },
        }),
        prisma.watershedTransaction.create({
          data: {
            watershedId: volunteer.user.watershed.id,
            type: "grant_volunteer",
            amount: volunteer.grant.watershedCredit,
            description: `Volunteer work verified: ${volunteer.grant.project.title}`,
            balanceAfter: newBalance,
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logError("api/projects/grant/volunteer/[vid]", error, {
      userId: session.user.id,
      route: `PATCH /api/projects/${id}/grant/volunteer/${vid}`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
