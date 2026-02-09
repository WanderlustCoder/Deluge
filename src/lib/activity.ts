import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/i18n/formatting";

export interface ActivityItem {
  id: string;
  type:
    | "signup"
    | "ad"
    | "loan"
    | "contribution"
    | "referral"
    | "cascade"
    | "loan_funded"
    | "milestone"
    | "community_join"
    | "project_update"
    | "community_funding"
    | "community_growth"
    | "community_project_milestone"
    | "community_goal_progress";
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Create a feed item in the database
export async function createFeedItem(
  type: string,
  subjectType: string,
  subjectId: string,
  actorId?: string,
  metadata?: Record<string, unknown>,
  isPublic = true
) {
  return prisma.activityFeedItem.create({
    data: {
      type,
      subjectType,
      subjectId,
      actorId: actorId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      isPublic,
    },
  });
}

// Get recent activity from combined sources (legacy + new feed items)
export async function getRecentActivity(limit = 20): Promise<ActivityItem[]> {
  const [signups, adViews, loans, contributions, referrals, feedItems] = await Promise.all(
    [
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.adView.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          userId: true,
          grossRevenue: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.loan.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          borrower: { select: { name: true } },
        },
      }),
      prisma.contribution.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          type: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.referral.findMany({
        where: { status: "activated" },
        orderBy: { activatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          activatedAt: true,
          referrer: { select: { name: true } },
        },
      }),
      prisma.activityFeedItem.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]
  );

  const items: ActivityItem[] = [];

  for (const u of signups) {
    items.push({
      id: `signup-${u.id}`,
      type: "signup",
      message: `${u.name} joined the platform`,
      timestamp: u.createdAt,
    });
  }

  for (const a of adViews) {
    items.push({
      id: `ad-${a.id}`,
      type: "ad",
      message: `${a.user.name} watched an ad ($${a.grossRevenue.toFixed(3)} revenue)`,
      timestamp: a.createdAt,
    });
  }

  for (const l of loans) {
    items.push({
      id: `loan-${l.id}`,
      type: "loan",
      message: `${l.borrower.name} applied for a $${l.amount.toFixed(2)} loan`,
      timestamp: l.createdAt,
    });
  }

  for (const c of contributions) {
    items.push({
      id: `contribution-${c.id}`,
      type: "contribution",
      message: `${c.user.name} made a $${c.amount.toFixed(2)} ${c.type} contribution`,
      timestamp: c.createdAt,
    });
  }

  for (const r of referrals) {
    items.push({
      id: `referral-${r.id}`,
      type: "referral",
      message: `${r.referrer.name}'s referral was activated`,
      timestamp: r.activatedAt ?? new Date(),
    });
  }

  // Add new feed items
  for (const item of feedItems) {
    const metadata = item.metadata ? JSON.parse(item.metadata) : {};
    items.push({
      id: `feed-${item.id}`,
      type: item.type as ActivityItem["type"],
      message: formatFeedItemMessage(item.type, metadata),
      timestamp: item.createdAt,
      metadata,
    });
  }

  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return items.slice(0, limit);
}

// Get public platform-wide feed
export async function getPublicFeed(limit = 50, offset = 0): Promise<ActivityItem[]> {
  const feedItems = await prisma.activityFeedItem.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return feedItems.map((item) => {
    const metadata = item.metadata ? JSON.parse(item.metadata) : {};
    return {
      id: item.id,
      type: item.type as ActivityItem["type"],
      message: formatFeedItemMessage(item.type, metadata),
      timestamp: item.createdAt,
      metadata,
    };
  });
}

// Get community activity feed with aggregated collective messages
export async function getCommunityFeed(
  communityId: string,
  limit = 30,
  offset = 0
): Promise<ActivityItem[]> {
  const projectIds = await prisma.communityProject
    .findMany({
      where: { communityId },
      select: { projectId: true },
    })
    .then((projects) => projects.map((p) => p.projectId));

  const feedItems = await prisma.activityFeedItem.findMany({
    where: {
      OR: [
        { subjectType: "community", subjectId: communityId },
        {
          subjectType: "project",
          subjectId: { in: projectIds },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  // Use collective language for community feeds
  return feedItems.map((item) => {
    const metadata = item.metadata ? JSON.parse(item.metadata) : {};
    return {
      id: item.id,
      type: item.type as ActivityItem["type"],
      message: formatCommunityMessage(item.type, metadata),
      timestamp: item.createdAt,
      metadata,
    };
  });
}

// Get aggregated community activity (grouped by time windows)
export async function getAggregatedCommunityFeed(
  communityId: string,
  limit = 10
): Promise<ActivityItem[]> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get project IDs for this community
  const projectIds = await prisma.communityProject
    .findMany({
      where: { communityId },
      select: { projectId: true },
    })
    .then((projects) => projects.map((p) => p.projectId));

  // Aggregate: new members this week
  const newMembersThisWeek = await prisma.communityMember.count({
    where: {
      communityId,
      joinedAt: { gte: oneWeekAgo },
    },
  });

  // Aggregate: projects funded this week
  const projectsFundedThisWeek = await prisma.allocation.groupBy({
    by: ["projectId"],
    where: {
      projectId: { in: projectIds },
      createdAt: { gte: oneWeekAgo },
    },
  });

  // Aggregate: total funded this month
  const fundedThisMonth = await prisma.allocation.aggregate({
    where: {
      projectId: { in: projectIds },
      createdAt: { gte: oneMonthAgo },
    },
    _sum: { amount: true },
  });

  const items: ActivityItem[] = [];

  // Add aggregated items
  if (newMembersThisWeek > 0) {
    items.push({
      id: `agg-members-${communityId}`,
      type: "community_growth",
      message: `${newMembersThisWeek} neighbor${newMembersThisWeek !== 1 ? "s" : ""} joined our community this week`,
      timestamp: now,
      metadata: { newMemberCount: newMembersThisWeek, timeWindow: "week" },
    });
  }

  if (projectsFundedThisWeek.length > 0) {
    items.push({
      id: `agg-funding-${communityId}`,
      type: "community_funding",
      message: `Our community funded ${projectsFundedThisWeek.length} project${projectsFundedThisWeek.length !== 1 ? "s" : ""} this week`,
      timestamp: now,
      metadata: {
        projectCount: projectsFundedThisWeek.length,
        timeWindow: "week",
      },
    });
  }

  if ((fundedThisMonth._sum.amount || 0) > 0) {
    const amount = fundedThisMonth._sum.amount || 0;
    items.push({
      id: `agg-total-${communityId}`,
      type: "community_funding",
      message: `Together we've raised $${amount.toFixed(2)} this month`,
      timestamp: new Date(now.getTime() - 1000), // Slightly older
      metadata: { totalAmount: amount, timeWindow: "month" },
    });
  }

  // Add recent individual items (with collective language)
  const recentItems = await getCommunityFeed(communityId, limit - items.length);
  items.push(...recentItems);

  return items.slice(0, limit);
}

// Format feed item message based on type and metadata
function formatFeedItemMessage(
  type: string,
  metadata: Record<string, unknown>
): string {
  switch (type) {
    case "cascade":
      return `${metadata.projectTitle || "A project"} reached ${metadata.stage || "a new"} cascade stage!`;
    case "loan_funded":
      return `${metadata.borrowerName || "A borrower"}'s loan was fully funded!`;
    case "milestone":
      return `${metadata.projectTitle || "A project"} reached ${metadata.percentage || "a"} funding milestone!`;
    case "community_join":
      return `${metadata.userName || "Someone"} joined ${metadata.communityName || "a community"}`;
    case "project_update":
      return `New update on ${metadata.projectTitle || "a project"}: ${metadata.updateTitle || ""}`;
    // Community-aggregated types (collective language, no individual names)
    case "community_funding":
      return `Our community funded ${metadata.projectCount || "a"} project${(metadata.projectCount as number) !== 1 ? "s" : ""} this week`;
    case "community_growth":
      return `${metadata.newMemberCount || "New"} neighbor${(metadata.newMemberCount as number) !== 1 ? "s" : ""} joined our community`;
    case "community_project_milestone":
      return `Together we reached ${metadata.percentage || "50"}% on ${metadata.projectTitle || "a project"}`;
    case "community_goal_progress":
      return `We're ${metadata.percentage || "0"}% of the way to our "${metadata.goalTitle || "goal"}" goal!`;
    default:
      return `Activity: ${type}`;
  }
}

// Format community feed messages with collective language
function formatCommunityMessage(
  type: string,
  metadata: Record<string, unknown>
): string {
  switch (type) {
    case "cascade":
      return `Together we pushed ${metadata.projectTitle || "a project"} to ${metadata.stage || "the next"} stage!`;
    case "milestone":
      return `We reached ${metadata.percentage || "a"} milestone on ${metadata.projectTitle || "a project"}!`;
    case "community_join":
      return `A new neighbor joined our community`;
    case "project_update":
      return `New update on ${metadata.projectTitle || "a project"}`;
    case "community_funding":
      return `Our community funded ${metadata.projectCount || "a"} project${(metadata.projectCount as number) !== 1 ? "s" : ""} this week`;
    case "community_growth":
      return `${metadata.newMemberCount || "New"} neighbor${(metadata.newMemberCount as number) !== 1 ? "s" : ""} joined our community`;
    case "community_project_milestone":
      return `Together we reached ${metadata.percentage || "50"}% on ${metadata.projectTitle || "a project"}`;
    case "community_goal_progress":
      return `We're ${metadata.percentage || "0"}% of the way to "${metadata.goalTitle || "our goal"}"!`;
    default:
      return formatFeedItemMessage(type, metadata);
  }
}

export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
