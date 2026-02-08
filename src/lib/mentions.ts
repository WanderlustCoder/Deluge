import { prisma } from "@/lib/prisma";

const MENTION_PATTERN = /@(\w+)/g;

/**
 * Parse @mentions from content.
 * Returns array of usernames mentioned.
 */
export function parseMentions(content: string): string[] {
  const matches = content.match(MENTION_PATTERN);
  if (!matches) return [];

  // Remove @ prefix and dedupe
  return [...new Set(matches.map((m) => m.slice(1)))];
}

/**
 * Resolve usernames to user IDs.
 */
export async function resolveUsernames(usernames: string[]): Promise<Map<string, string>> {
  if (usernames.length === 0) return new Map();

  // For this implementation, we'll match by name
  // In production, you might want a unique username field
  const users = await prisma.user.findMany({
    where: {
      name: { in: usernames },
    },
    select: { id: true, name: true },
  });

  return new Map(users.map((u) => [u.name, u.id]));
}

/**
 * Create mention records for a discussion.
 */
export async function createMentions(
  discussionId: string,
  content: string
): Promise<string[]> {
  const usernames = parseMentions(content);
  if (usernames.length === 0) return [];

  const usernameToId = await resolveUsernames(usernames);
  const userIds = Array.from(usernameToId.values());

  if (userIds.length === 0) return [];

  // Create mention records (upsert to avoid duplicates)
  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.discussionMention.upsert({
        where: { discussionId_userId: { discussionId, userId } },
        update: {},
        create: { discussionId, userId },
      })
    )
  );

  return userIds;
}

/**
 * Notify mentioned users.
 */
export async function notifyMentionedUsers(
  discussionId: string,
  mentionedUserIds: string[],
  mentionerName: string,
  discussionTitle: string,
  communityId: string
) {
  if (mentionedUserIds.length === 0) return;

  // Create notifications for each mentioned user
  await prisma.notification.createMany({
    data: mentionedUserIds.map((userId) => ({
      userId,
      type: "mention",
      title: "You were mentioned",
      message: `${mentionerName} mentioned you in "${discussionTitle}"`,
      data: JSON.stringify({
        discussionId,
        communityId,
      }),
    })),
  });
}

/**
 * Get mentions for a discussion.
 */
export async function getDiscussionMentions(discussionId: string) {
  return prisma.discussionMention.findMany({
    where: { discussionId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

/**
 * Get discussions where a user was mentioned.
 */
export async function getUserMentions(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [mentions, total] = await Promise.all([
    prisma.discussionMention.findMany({
      where: { userId },
      include: {
        discussion: {
          include: {
            user: { select: { id: true, name: true } },
            community: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.discussionMention.count({ where: { userId } }),
  ]);

  return {
    mentions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Render content with clickable mention links.
 */
export function renderMentions(content: string): string {
  return content.replace(
    MENTION_PATTERN,
    '<a href="/users/$1" class="text-sky hover:underline">@$1</a>'
  );
}
