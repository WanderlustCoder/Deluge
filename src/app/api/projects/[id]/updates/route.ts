import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { projectUpdateSchema } from "@/lib/validation";

// GET: list updates for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const updates = await prisma.projectUpdate.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  // Parse imageUrls JSON
  const parsedUpdates = updates.map((update) => ({
    ...update,
    imageUrls: update.imageUrls ? JSON.parse(update.imageUrls) : null,
  }));

  return NextResponse.json(parsedUpdates);
}

// POST: create a project update (admin only)
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
      { error: "Only admins can post project updates" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        allocations: {
          select: { userId: true },
          distinct: ["userId"],
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const update = await prisma.projectUpdate.create({
      data: {
        projectId: id,
        title: parsed.data.title,
        body: parsed.data.body,
        imageUrls: parsed.data.imageUrls
          ? JSON.stringify(parsed.data.imageUrls)
          : null,
      },
    });

    // Create notifications for all project backers
    const backerIds = project.allocations.map((a) => a.userId);
    if (backerIds.length > 0) {
      await prisma.notification.createMany({
        data: backerIds.map((userId) => ({
          userId,
          type: "project_update",
          title: `Update: ${project.title}`,
          message: parsed.data.title,
          data: JSON.stringify({
            projectId: id,
            updateId: update.id,
          }),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...update,
        imageUrls: parsed.data.imageUrls || null,
      },
    });
  } catch (error) {
    logError("api/projects/updates", error, {
      userId: session.user.id,
      route: `POST /api/projects/${id}/updates`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
