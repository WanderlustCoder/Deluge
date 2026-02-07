import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markComplete } from "@/lib/project-completion";
import { logError } from "@/lib/logger";

// POST: Mark project as completed (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { impactSummary } = body;

    if (!impactSummary?.trim()) {
      return NextResponse.json(
        { error: "Impact summary is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "funded") {
      return NextResponse.json(
        { error: "Only funded projects can be marked complete" },
        { status: 400 }
      );
    }

    const completed = await markComplete(id, impactSummary.trim());

    return NextResponse.json({
      success: true,
      data: {
        id: completed.id,
        status: completed.status,
        completedAt: completed.completedAt,
      },
    });
  } catch (error) {
    logError("api/projects/complete", error, {
      projectId: id,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
