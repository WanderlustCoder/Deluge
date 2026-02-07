import { prisma } from "@/lib/prisma";
import { createFeedItem } from "@/lib/activity";

// Goal progress milestones to track
const GOAL_MILESTONES = [0.25, 0.5, 0.75, 1.0];

/**
 * Update goal progress when member funds a project
 * Checks if allocation matches goal category and updates currentAmount
 */
export async function updateGoalProgress(
  communityId: string,
  projectCategory: string,
  amount: number
) {
  // Find active goals that match this category (or have no category filter)
  const goals = await prisma.communityGoal.findMany({
    where: {
      communityId,
      status: "active",
      OR: [{ category: projectCategory }, { category: null }],
    },
  });

  for (const goal of goals) {
    const newAmount = goal.currentAmount + amount;
    const wasComplete = goal.currentAmount >= goal.targetAmount;
    const isComplete = newAmount >= goal.targetAmount;
    const previousProgress = goal.currentAmount / goal.targetAmount;
    const newProgress = newAmount / goal.targetAmount;

    // Check for milestone crossings
    for (const milestone of GOAL_MILESTONES) {
      if (previousProgress < milestone && newProgress >= milestone) {
        // Create activity feed item for milestone
        await createFeedItem(
          "community_goal_progress",
          "community",
          communityId,
          undefined,
          {
            goalId: goal.id,
            goalTitle: goal.title,
            percentage: Math.round(milestone * 100),
            currentAmount: newAmount,
            targetAmount: goal.targetAmount,
          }
        );
      }
    }

    // Update goal
    await prisma.communityGoal.update({
      where: { id: goal.id },
      data: {
        currentAmount: newAmount,
        status: isComplete && !wasComplete ? "completed" : goal.status,
      },
    });
  }
}

/**
 * Check and expire goals past their deadline
 */
export async function expireGoals() {
  const now = new Date();

  await prisma.communityGoal.updateMany({
    where: {
      status: "active",
      deadline: { lt: now },
    },
    data: {
      status: "expired",
    },
  });
}

/**
 * Get goals for a community with progress info
 */
export async function getCommunityGoals(communityId: string) {
  const goals = await prisma.communityGoal.findMany({
    where: { communityId },
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
  });

  return goals.map((goal) => ({
    ...goal,
    progress: Math.min(goal.currentAmount / goal.targetAmount, 1),
    daysRemaining: Math.max(
      0,
      Math.ceil(
        (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    ),
  }));
}

/**
 * Create a new community goal (admin/steward only)
 */
export async function createCommunityGoal(data: {
  communityId: string;
  title: string;
  description: string;
  targetAmount: number;
  deadline: Date;
  category?: string;
  createdBy: string;
}) {
  return prisma.communityGoal.create({
    data: {
      communityId: data.communityId,
      title: data.title,
      description: data.description,
      targetAmount: data.targetAmount,
      deadline: data.deadline,
      category: data.category || null,
      createdBy: data.createdBy,
    },
  });
}
