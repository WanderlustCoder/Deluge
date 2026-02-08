import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectRallies, createRally, checkRallyProgress } from "@/lib/rallies";
import { logError } from "@/lib/logger";

// GET: List rallies for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const rallies = await getProjectRallies(id);

    // Enhance with progress info
    const enhanced = await Promise.all(
      rallies.map(async (rally) => {
        const progress = await checkRallyProgress(rally.id);
        return {
          ...rally,
          progress: progress.progress,
          currentValue: progress.currentValue,
          isComplete: progress.isComplete,
        };
      })
    );

    return NextResponse.json(enhanced);
  } catch (error) {
    logError("api/projects/rallies", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new rally
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, targetType, targetValue, deadlineDays } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!["backers", "amount"].includes(targetType)) {
      return NextResponse.json(
        { error: "Target type must be 'backers' or 'amount'" },
        { status: 400 }
      );
    }

    if (!targetValue || targetValue <= 0) {
      return NextResponse.json(
        { error: "Target value must be positive" },
        { status: 400 }
      );
    }

    if (!deadlineDays || deadlineDays < 1 || deadlineDays > 7) {
      return NextResponse.json(
        { error: "Deadline must be 1-7 days from now" },
        { status: 400 }
      );
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + deadlineDays);

    const rally = await createRally(id, session.user.id, {
      title: title.trim(),
      targetType,
      targetValue,
      deadline,
    });

    return NextResponse.json({
      success: true,
      data: rally,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    logError("api/projects/rallies", error, {
      projectId: id,
      userId: session.user.id,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
