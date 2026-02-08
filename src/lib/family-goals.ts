/**
 * Family Goals
 *
 * Shared family giving goals and progress tracking.
 */

import { prisma } from "@/lib/prisma";
import { logInfo } from "@/lib/logger";

export type GoalTargetType =
  | "projects_funded"
  | "amount_given"
  | "categories_supported";

/**
 * Create a family goal
 */
export async function createFamilyGoal(
  familyId: string,
  goal: {
    title: string;
    description?: string;
    targetType: GoalTargetType;
    targetValue: number;
    deadline?: Date;
  },
  creatorId: string
): Promise<{ goalId: string }> {
  // Verify creator is family member
  const member = await prisma.familyMember.findFirst({
    where: { familyId, userId: creatorId },
  });

  if (!member) {
    throw new Error("Not a family member");
  }

  const created = await prisma.familyGoal.create({
    data: {
      familyId,
      title: goal.title,
      description: goal.description,
      targetType: goal.targetType,
      targetValue: goal.targetValue,
      deadline: goal.deadline,
      status: "active",
    },
  });

  // Record activity
  await prisma.familyActivity.create({
    data: {
      familyId,
      memberId: member.id,
      actionType: "goal_created",
      description: `Created goal: ${goal.title}`,
    },
  });

  logInfo("family-goals", "Goal created", { familyId, goalId: created.id });

  return { goalId: created.id };
}

/**
 * Get active goals for a family
 */
export async function getActiveGoals(familyId: string) {
  return prisma.familyGoal.findMany({
    where: { familyId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get all goals for a family
 */
export async function getAllGoals(familyId: string) {
  return prisma.familyGoal.findMany({
    where: { familyId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update goal manually (for admin adjustments)
 */
export async function updateGoal(
  goalId: string,
  updates: {
    title?: string;
    description?: string;
    targetValue?: number;
    deadline?: Date | null;
    status?: "active" | "completed" | "cancelled";
  },
  adminUserId: string
): Promise<void> {
  const goal = await prisma.familyGoal.findUnique({
    where: { id: goalId },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  // Verify admin
  const admin = await prisma.familyMember.findFirst({
    where: { familyId: goal.familyId, userId: adminUserId, role: "admin" },
  });

  if (!admin) {
    throw new Error("Only admins can update goals");
  }

  await prisma.familyGoal.update({
    where: { id: goalId },
    data: updates,
  });

  logInfo("family-goals", "Goal updated", { goalId });
}

/**
 * Delete a goal
 */
export async function deleteGoal(
  goalId: string,
  adminUserId: string
): Promise<void> {
  const goal = await prisma.familyGoal.findUnique({
    where: { id: goalId },
  });

  if (!goal) {
    throw new Error("Goal not found");
  }

  const admin = await prisma.familyMember.findFirst({
    where: { familyId: goal.familyId, userId: adminUserId, role: "admin" },
  });

  if (!admin) {
    throw new Error("Only admins can delete goals");
  }

  await prisma.familyGoal.delete({
    where: { id: goalId },
  });

  logInfo("family-goals", "Goal deleted", { goalId });
}

/**
 * Calculate progress for all active goals
 * Call this after family contributions
 */
export async function recalculateGoalProgress(familyId: string): Promise<void> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: true,
      goals: { where: { status: "active" } },
    },
  });

  if (!family) return;

  const userIds = family.members.map((m) => m.userId);

  for (const goal of family.goals) {
    let currentValue = 0;

    switch (goal.targetType) {
      case "projects_funded": {
        const projects = await prisma.allocation.findMany({
          where: { userId: { in: userIds } },
          select: { projectId: true },
          distinct: ["projectId"],
        });
        currentValue = projects.length;
        break;
      }
      case "amount_given": {
        const total = await prisma.allocation.aggregate({
          where: { userId: { in: userIds } },
          _sum: { amount: true },
        });
        currentValue = total._sum.amount || 0;
        break;
      }
      case "categories_supported": {
        const categories = await prisma.allocation.findMany({
          where: { userId: { in: userIds } },
          include: { project: { select: { category: true } } },
        });
        const uniqueCategories = new Set(categories.map((a) => a.project.category));
        currentValue = uniqueCategories.size;
        break;
      }
    }

    const completed = currentValue >= goal.targetValue;

    await prisma.familyGoal.update({
      where: { id: goal.id },
      data: {
        currentValue,
        status: completed ? "completed" : "active",
      },
    });

    if (completed && goal.status === "active") {
      await prisma.familyActivity.create({
        data: {
          familyId,
          memberId: "",
          actionType: "goal_completed",
          description: `Completed goal: ${goal.title}`,
        },
      });
    }
  }
}

/**
 * Get goal progress summary
 */
export async function getGoalSummary(familyId: string): Promise<{
  active: number;
  completed: number;
  cancelled: number;
  closestToCompletion: {
    id: string;
    title: string;
    percentComplete: number;
  } | null;
}> {
  const goals = await prisma.familyGoal.findMany({
    where: { familyId },
  });

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const cancelled = goals.filter((g) => g.status === "cancelled");

  let closestToCompletion = null;
  if (active.length > 0) {
    const sorted = active
      .map((g) => ({
        id: g.id,
        title: g.title,
        percentComplete: Math.min((g.currentValue / g.targetValue) * 100, 100),
      }))
      .sort((a, b) => b.percentComplete - a.percentComplete);

    closestToCompletion = sorted[0];
  }

  return {
    active: active.length,
    completed: completed.length,
    cancelled: cancelled.length,
    closestToCompletion,
  };
}
