import { prisma } from "@/lib/prisma";

export type FollowTargetType = "user" | "project" | "community";

/**
 * Follow a user.
 */
export async function followUser(followerId: string, followeeId: string) {
  if (followerId === followeeId) {
    throw new Error("Cannot follow yourself");
  }

  const result = await prisma.$transaction(async (tx) => {
    const follow = await tx.userFollow.create({
      data: { followerId, followeeId },
    });

    // Update counts
    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });
    await tx.user.update({
      where: { id: followeeId },
      data: { followerCount: { increment: 1 } },
    });

    return follow;
  });

  return result;
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(followerId: string, followeeId: string) {
  const existing = await prisma.userFollow.findUnique({
    where: { followerId_followeeId: { followerId, followeeId } },
  });

  if (!existing) {
    throw new Error("Not following this user");
  }

  await prisma.$transaction(async (tx) => {
    await tx.userFollow.delete({
      where: { id: existing.id },
    });

    await tx.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    });
    await tx.user.update({
      where: { id: followeeId },
      data: { followerCount: { decrement: 1 } },
    });
  });
}

/**
 * Follow a community.
 */
export async function followCommunity(userId: string, communityId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const follow = await tx.communityFollow.create({
      data: { userId, communityId },
    });

    await tx.community.update({
      where: { id: communityId },
      data: { followerCount: { increment: 1 } },
    });

    return follow;
  });

  return result;
}

/**
 * Unfollow a community.
 */
export async function unfollowCommunity(userId: string, communityId: string) {
  const existing = await prisma.communityFollow.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });

  if (!existing) {
    throw new Error("Not following this community");
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityFollow.delete({
      where: { id: existing.id },
    });

    await tx.community.update({
      where: { id: communityId },
      data: { followerCount: { decrement: 1 } },
    });
  });
}

/**
 * Check if following a target.
 */
export async function isFollowing(
  userId: string,
  targetType: FollowTargetType,
  targetId: string
): Promise<boolean> {
  switch (targetType) {
    case "user": {
      const follow = await prisma.userFollow.findUnique({
        where: { followerId_followeeId: { followerId: userId, followeeId: targetId } },
      });
      return !!follow;
    }
    case "project": {
      const follow = await prisma.projectFollow.findUnique({
        where: { userId_projectId: { userId, projectId: targetId } },
      });
      return !!follow;
    }
    case "community": {
      const follow = await prisma.communityFollow.findUnique({
        where: { userId_communityId: { userId, communityId: targetId } },
      });
      return !!follow;
    }
  }
}

/**
 * Get followers of a user.
 */
export async function getUserFollowers(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followeeId: userId },
      include: {
        follower: {
          select: { id: true, name: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userFollow.count({ where: { followeeId: userId } }),
  ]);

  return {
    followers: followers.map((f) => f.follower),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get users that a user is following.
 */
export async function getUserFollowing(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        followee: {
          select: { id: true, name: true, avatarUrl: true, bio: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.userFollow.count({ where: { followerId: userId } }),
  ]);

  return {
    following: following.map((f) => f.followee),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get followed communities for a user.
 */
export async function getFollowedCommunities(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [follows, total] = await Promise.all([
    prisma.communityFollow.findMany({
      where: { userId },
      include: {
        community: {
          select: { id: true, name: true, description: true, imageUrl: true, memberCount: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.communityFollow.count({ where: { userId } }),
  ]);

  return {
    communities: follows.map((f) => f.community),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get all followed entity IDs for a user (for feed generation).
 */
export async function getFollowedEntityIds(userId: string) {
  const [userFollows, projectFollows, communityFollows, memberCommunities] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followeeId: true },
    }),
    prisma.projectFollow.findMany({
      where: { userId },
      select: { projectId: true },
    }),
    prisma.communityFollow.findMany({
      where: { userId },
      select: { communityId: true },
    }),
    // Also include communities the user is a member of
    prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    }),
  ]);

  const allCommunityIds = new Set([
    ...communityFollows.map((f) => f.communityId),
    ...memberCommunities.map((m) => m.communityId),
  ]);

  return {
    userIds: userFollows.map((f) => f.followeeId),
    projectIds: projectFollows.map((f) => f.projectId),
    communityIds: Array.from(allCommunityIds),
  };
}
