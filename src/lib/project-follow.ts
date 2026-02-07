import { prisma } from "@/lib/prisma";

/**
 * Toggle follow status for a project.
 * Returns the new follow state.
 */
export async function toggleFollow(
  userId: string,
  projectId: string
): Promise<{ following: boolean }> {
  const existing = await prisma.projectFollow.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (existing) {
    await prisma.projectFollow.delete({
      where: { id: existing.id },
    });
    return { following: false };
  }

  await prisma.projectFollow.create({
    data: { userId, projectId },
  });
  return { following: true };
}

/**
 * Check if a user is following a project.
 */
export async function isFollowing(
  userId: string,
  projectId: string
): Promise<boolean> {
  const follow = await prisma.projectFollow.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  return !!follow;
}

/**
 * Get follower count for a project.
 */
export async function getFollowerCount(projectId: string): Promise<number> {
  return prisma.projectFollow.count({
    where: { projectId },
  });
}

/**
 * Get all follower IDs for a project (for notifications).
 */
export async function getFollowerIds(projectId: string): Promise<string[]> {
  const followers = await prisma.projectFollow.findMany({
    where: { projectId },
    select: { userId: true },
  });
  return followers.map((f) => f.userId);
}

/**
 * Auto-follow all backers of a project when it reaches funded status.
 */
export async function autoFollowBackers(projectId: string) {
  const allocations = await prisma.allocation.findMany({
    where: { projectId },
    select: { userId: true },
    distinct: ["userId"],
  });

  const backerIds = allocations.map((a) => a.userId);

  // Use upsert-like behavior - skip if already following
  for (const userId of backerIds) {
    await prisma.projectFollow.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: {},
      create: { userId, projectId },
    });
  }

  return backerIds.length;
}

/**
 * Get projects a user is following.
 */
export async function getFollowedProjects(userId: string) {
  const follows = await prisma.projectFollow.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          fundingGoal: true,
          fundingRaised: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return follows.map((f) => f.project);
}
