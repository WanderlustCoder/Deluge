import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { communityGrantSchema } from "@/lib/validation";

// GET: get grant info for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const grant = await prisma.communityGrant.findUnique({
    where: { projectId: id },
    include: {
      volunteers: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!grant) {
    return NextResponse.json({ grant: null });
  }

  // Check if current user has volunteered
  const userVolunteer = grant.volunteers.find(
    (v) => v.user.id === session.user.id
  );

  return NextResponse.json({
    grant: {
      ...grant,
      beforePhotos: grant.beforePhotos ? JSON.parse(grant.beforePhotos) : null,
      afterPhotos: grant.afterPhotos ? JSON.parse(grant.afterPhotos) : null,
    },
    slotsRemaining:
      grant.volunteerSlots -
      grant.volunteers.filter((v) => v.status !== "cancelled").length,
    userVolunteerId: userVolunteer?.id || null,
    userVolunteerStatus: userVolunteer?.status || null,
  });
}

// POST: create a community grant project (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accountType: true },
  });

  if (user?.accountType !== "admin") {
    return NextResponse.json(
      { error: "Only admins can create community grants" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = communityGrantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: { grant: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.grant) {
      return NextResponse.json(
        { error: "This project already has a grant" },
        { status: 400 }
      );
    }

    const grant = await prisma.communityGrant.create({
      data: {
        projectId: id,
        volunteerSlots: parsed.data.volunteerSlots,
        watershedCredit: parsed.data.watershedCredit,
        requirements: parsed.data.requirements,
      },
    });

    return NextResponse.json({ success: true, data: grant });
  } catch (error) {
    logError("api/projects/grant", error, {
      userId: session.user.id,
      route: `POST /api/projects/${id}/grant`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: update grant (admin only - for adding photos, completing)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accountType: true },
  });

  if (user?.accountType !== "admin") {
    return NextResponse.json(
      { error: "Only admins can update grants" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const grant = await prisma.communityGrant.findUnique({
      where: { projectId: id },
    });

    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.beforePhotos) {
      updateData.beforePhotos = JSON.stringify(body.beforePhotos);
    }

    if (body.afterPhotos) {
      updateData.afterPhotos = JSON.stringify(body.afterPhotos);
    }

    if (body.completed === true) {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.communityGrant.update({
      where: { projectId: id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logError("api/projects/grant", error, {
      userId: session.user.id,
      route: `PATCH /api/projects/${id}/grant`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
