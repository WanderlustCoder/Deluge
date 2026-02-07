import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// POST: claim a volunteer slot
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const grant = await prisma.communityGrant.findUnique({
      where: { projectId: id },
      include: {
        volunteers: {
          where: { status: { not: "cancelled" } },
        },
      },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    if (grant.completedAt) {
      return NextResponse.json(
        { error: "This grant has been completed" },
        { status: 400 }
      );
    }

    // Check if user already volunteered
    const existing = grant.volunteers.find(
      (v) => v.userId === session.user.id
    );

    if (existing) {
      return NextResponse.json(
        { error: "You have already volunteered for this grant" },
        { status: 400 }
      );
    }

    // Check if slots available
    if (grant.volunteers.length >= grant.volunteerSlots) {
      return NextResponse.json(
        { error: "No volunteer slots available" },
        { status: 400 }
      );
    }

    const volunteer = await prisma.communityGrantVolunteer.create({
      data: {
        grantId: grant.id,
        userId: session.user.id,
        status: "claimed",
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: volunteer });
  } catch (error) {
    logError("api/projects/grant/volunteer", error, {
      userId: session.user.id,
      route: `POST /api/projects/${id}/grant/volunteer`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
