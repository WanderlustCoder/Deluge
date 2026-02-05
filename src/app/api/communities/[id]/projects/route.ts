import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addProjectSchema = z.object({
  projectId: z.string().min(1),
});

// GET: community projects
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const projects = await prisma.communityProject.findMany({
    where: { communityId: id },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects.map((cp) => cp.project));
}

// POST: add project to community (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if user is community admin
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: id, userId: session.user.id },
    },
  });

  if (!membership || membership.role !== "admin") {
    return NextResponse.json(
      { error: "Only community admins can add projects." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = addProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check if already linked
    const existing = await prisma.communityProject.findUnique({
      where: {
        communityId_projectId: {
          communityId: id,
          projectId: parsed.data.projectId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Project already in this community." },
        { status: 400 }
      );
    }

    await prisma.communityProject.create({
      data: {
        communityId: id,
        projectId: parsed.data.projectId,
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
