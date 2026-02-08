import { prisma } from "@/lib/prisma";
import { getFollowedEntityIds } from "@/lib/follows";

export type FeedActionType =
  | "funded"
  | "cascaded"
  | "posted_update"
  | "joined_community"
  | "proposed_project"
  | "milestone"
  | "rally_created"
  | "loan_funded"
  | "badge_earned";

interface GenerateFeedItemData {
  actorId?: string;
  actionType: FeedActionType;
  projectId?: string;
  communityId?: string;
  loanId?: string;
  updateId?: string;
  title: string;
  description?: string;
}

/**
 * Generate feed items for users who follow the relevant entities.
 */
export async function generateFeedItems(data: GenerateFeedItemData) {
  // Find all users who should receive this feed item
  const recipientIds = new Set<string>();

  // Get followers of the relevant entity
  if (data.projectId) {
    const followers = await prisma.projectFollow.findMany({
      where: { projectId: data.projectId },
      select: { userId: true },
    });
    followers.forEach((f) => recipientIds.add(f.userId));
  }

  if (data.communityId) {
    // Get community followers
    const followers = await prisma.communityFollow.findMany({
      where: { communityId: data.communityId },
      select: { userId: true },
    });
    followers.forEach((f) => recipientIds.add(f.userId));

    // Get community members
    const members = await prisma.communityMember.findMany({
      where: { communityId: data.communityId },
      select: { userId: true },
    });
    members.forEach((m) => recipientIds.add(m.userId));
  }

  if (data.actorId) {
    // Get followers of the actor
    const followers = await prisma.userFollow.findMany({
      where: { followeeId: data.actorId },
      select: { followerId: true },
    });
    followers.forEach((f) => recipientIds.add(f.followerId));
  }

  // Don't send feed item to the actor themselves
  if (data.actorId) {
    recipientIds.delete(data.actorId);
  }

  if (recipientIds.size === 0) {
    return [];
  }

  // Create feed items in batch
  const feedItems = await prisma.feedItem.createMany({
    data: Array.from(recipientIds).map((userId) => ({
      userId,
      actorId: data.actorId,
      actionType: data.actionType,
      projectId: data.projectId,
      communityId: data.communityId,
      loanId: data.loanId,
      updateId: data.updateId,
      title: data.title,
      description: data.description,
    })),
  });

  return feedItems;
}

/**
 * Get personalized feed for a user.
 */
export async function getFeed(
  userId: string,
  page: number = 1,
  limit: number = 20,
  filter?: {
    unreadOnly?: boolean;
    actionTypes?: FeedActionType[];
  }
) {
  const skip = (page - 1) * limit;

  const where: {
    userId: string;
    read?: boolean;
    actionType?: { in: string[] };
  } = { userId };

  if (filter?.unreadOnly) {
    where.read = false;
  }

  if (filter?.actionTypes?.length) {
    where.actionType = { in: filter.actionTypes };
  }

  const [items, total, unreadCount] = await Promise.all([
    prisma.feedItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feedItem.count({ where }),
    prisma.feedItem.count({ where: { userId, read: false } }),
  ]);

  return {
    items,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get recent activity across all followed entities (alternative feed approach).
 */
export async function getActivityFeed(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const followed = await getFollowedEntityIds(userId);

  // Get recent activity from ActivityFeedItem that matches followed entities
  const skip = (page - 1) * limit;

  const items = await prisma.activityFeedItem.findMany({
    where: {
      OR: [
        {
          subjectType: "project",
          subjectId: { in: followed.projectIds },
        },
        {
          subjectType: "community",
          subjectId: { in: followed.communityIds },
        },
        {
          actorId: { in: followed.userIds },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return items;
}

/**
 * Mark a feed item as read.
 */
export async function markAsRead(feedItemId: string, userId: string) {
  return prisma.feedItem.updateMany({
    where: { id: feedItemId, userId },
    data: { read: true },
  });
}

/**
 * Mark all feed items as read for a user.
 */
export async function markAllAsRead(userId: string) {
  return prisma.feedItem.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

/**
 * Delete old feed items (cleanup job).
 */
export async function pruneOldFeedItems(daysOld: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  return prisma.feedItem.deleteMany({
    where: {
      createdAt: { lt: cutoff },
      read: true,
    },
  });
}

/**
 * Get unread count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.feedItem.count({
    where: { userId, read: false },
  });
}
