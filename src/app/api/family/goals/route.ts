import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFamily } from "@/lib/family";
import { createFamilyGoal, getAllGoals, type GoalTargetType } from "@/lib/family-goals";
import { logError } from "@/lib/logger";

/**
 * GET /api/family/goals
 * Get family goals
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ goals: [] });
    }

    const goals = await getAllGoals(family.id);

    return NextResponse.json({ goals });
  } catch (error) {
    logError("api/family/goals", error);
    return NextResponse.json(
      { error: "Failed to get goals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/family/goals
 * Create a new family goal
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json(
        { error: "You don't have a family" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, targetType, targetValue, deadline } = body as {
      title: string;
      description?: string;
      targetType: GoalTargetType;
      targetValue: number;
      deadline?: string;
    };

    if (!title || !targetType || !targetValue) {
      return NextResponse.json(
        { error: "Title, target type, and target value are required" },
        { status: 400 }
      );
    }

    const result = await createFamilyGoal(
      family.id,
      {
        title,
        description,
        targetType,
        targetValue,
        deadline: deadline ? new Date(deadline) : undefined,
      },
      session.user.id
    );

    return NextResponse.json({ success: true, goalId: result.goalId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create goal";
    logError("api/family/goals", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
