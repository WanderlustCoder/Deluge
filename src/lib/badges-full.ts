import { prisma } from "@/lib/prisma";
import { notifyBadgeEarned } from "@/lib/notifications";

// Badge tier definitions
export const BADGE_TIERS = {
  1: { name: "First Drop", color: "text-sky" },
  2: { name: "Stream", color: "text-teal" },
  3: { name: "Creek", color: "text-ocean" },
  4: { name: "River", color: "text-gold" },
  5: { name: "Watershed", color: "text-purple-500" },
} as const;

// Complete badge definitions
export const BADGE_DEFINITIONS = [
  // Tier 1: First Drop
  { key: "first_drop", name: "First Drop", description: "Made first cash contribution", tier: 1, icon: "💧", category: "contribution", target: 1 },
  { key: "community_member", name: "Community Member", description: "Joined first community", tier: 1, icon: "👥", category: "community", target: 1 },
  { key: "profile_complete", name: "Profile Complete", description: "Added photo and bio", tier: 1, icon: "✨", category: "profile", target: 1 },
  { key: "time_giver", name: "Time Giver", description: "Watched first ad to fund a project", tier: 1, icon: "⏰", category: "contribution", target: 1 },
  { key: "first_referral", name: "First Referral", description: "Referred a friend who signed up", tier: 1, icon: "🔗", category: "growth", target: 1 },

  // Tier 2: Stream
  { key: "steady_flow", name: "Steady Flow", description: "Contributed every month for 3 months", tier: 2, icon: "🌊", category: "contribution", target: 3 },
  { key: "promoter", name: "Promoter", description: "Shared a project that got 5+ new backers", tier: 2, icon: "📢", category: "impact", target: 5 },
  { key: "proposer", name: "Proposer", description: "Proposed a project that went live", tier: 2, icon: "💡", category: "impact", target: 1 },
  { key: "conversationalist", name: "Conversationalist", description: "Posted 10 comments across discussions", tier: 2, icon: "💬", category: "community", target: 10 },
  { key: "week_streak", name: "Week Streak", description: "Watched ads 7 days in a row", tier: 2, icon: "🔥", category: "streak", target: 7 },

  // Tier 3: Creek
  { key: "project_backer_x10", name: "Project Backer x10", description: "Backed 10 different projects", tier: 3, icon: "🎯", category: "contribution", target: 10 },
  { key: "social_butterfly", name: "Social Butterfly", description: "Invited 3 friends who joined and became active", tier: 3, icon: "🦋", category: "growth", target: 3 },
  { key: "storyteller", name: "Storyteller", description: "Shared a cascade story that reached 50+ people", tier: 3, icon: "📖", category: "impact", target: 50 },
  { key: "month_streak", name: "Month Streak", description: "Watched ads 30 days in a row", tier: 3, icon: "⚡", category: "streak", target: 30 },
  { key: "first_cascade", name: "First Cascade", description: "Part of your first fully-funded project", tier: 3, icon: "🌈", category: "impact", target: 1 },

  // Tier 4: River
  { key: "community_builder", name: "Community Builder", description: "Community you started has 100+ members", tier: 4, icon: "🏛️", category: "community", target: 100 },
  { key: "serial_proposer", name: "Serial Proposer", description: "Proposed 3+ projects that got funded", tier: 4, icon: "🚀", category: "impact", target: 3 },
  { key: "impact_witness", name: "Impact Witness", description: "Received 5 impact updates from backed projects", tier: 4, icon: "👁️", category: "impact", target: 5 },
  { key: "rallier", name: "Rallier", description: "Promoted a project from <25% to fully funded", tier: 4, icon: "📣", category: "impact", target: 1 },
  { key: "six_month_flow", name: "Six-Month Flow", description: "Contributed every month for 6 months", tier: 4, icon: "💎", category: "contribution", target: 6 },

  // Tier 5: Watershed (Legendary)
  { key: "movement_builder", name: "Movement Builder", description: "Referred 25+ active users", tier: 5, icon: "🌟", category: "growth", target: 25 },
  { key: "cascade_veteran", name: "Cascade Veteran", description: "Part of 10 fully-funded projects", tier: 5, icon: "🏆", category: "impact", target: 10 },
  { key: "catalyst", name: "Catalyst", description: "Proposed or promoted projects that collectively funded $10K+", tier: 5, icon: "⭐", category: "impact", target: 10000 },
  { key: "year_of_flow", name: "Year of Flow", description: "Contributed every month for 12 months", tier: 5, icon: "👑", category: "contribution", target: 12 },
  { key: "community_pillar", name: "Community Pillar", description: "Active in 5+ communities with regular contributions", tier: 5, icon: "🗿", category: "community", target: 5 },
] as const;

export type BadgeKey = typeof BADGE_DEFINITIONS[number]["key"];

interface UserStats {
  adCount: number;
  contributionCount: number;
  projectsFunded: number;
  projectsCascaded: number;
  communitiesJoined: number;
  communitiesCreatedWith100Members: number;
  referralsActivated: number;
  commentCount: number;
  proposalsApproved: number;
  sharesWithBackers: number;
  impactUpdatesReceived: number;
  consecutiveMonthsContributing: number;
  streakDays: number;
  hasProfileComplete: boolean;
  ralliesSuccessful: number;
  totalFundingFromProposals: number;
  activeCommunitiesWithContributions: number;
}

/**
 * Get all stats needed for badge checking.
 */
async function getUserStats(userId: string): Promise<UserStats> {
  const [
    adCount,
    contributionCount,
    projectsFunded,
    projectsCascaded,
    communitiesJoined,
    referralsActivated,
    commentCount,
    proposalsApproved,
    streak,
    user,
    impactUpdatesReceived,
  ] = await Promise.all([
    prisma.adView.count({ where: { userId } }),
    prisma.contribution.count({ where: { userId } }),
    prisma.allocation.groupBy({ by: ["projectId"], where: { userId } }),
    prisma.allocation.findMany({
      where: { userId },
      select: { project: { select: { status: true } } },
    }),
    prisma.communityMember.count({ where: { userId } }),
    prisma.referral.count({
      where: { referrerId: userId, status: "activated" },
    }),
    prisma.comment.count({ where: { userId } }),
    prisma.projectProposal.count({
      where: { proposerId: userId, status: "approved" },
    }),
    prisma.streak.findUnique({
      where: { userId_type: { userId, type: "ad_watch" } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { bio: true, avatarUrl: true },
    }),
    prisma.projectUpdate.count({
      where: {
        project: {
          allocations: { some: { userId } },
        },
      },
    }),
  ]);

  // Calculate consecutive months contributing
  const contributions = await prisma.contribution.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  let consecutiveMonths = 0;
  if (contributions.length > 0) {
    const now = new Date();
    let currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentMonth);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const hasContribution = contributions.some(
        (c) => c.createdAt >= monthStart && c.createdAt <= monthEnd
      );

      if (hasContribution) {
        consecutiveMonths++;
        currentMonth.setMonth(currentMonth.getMonth() - 1);
      } else {
        break;
      }
    }
  }

  // Check for communities user created with 100+ members
  const createdCommunities = await prisma.community.findMany({
    where: { createdBy: userId },
    select: { memberCount: true },
  });
  const communitiesCreatedWith100Members = createdCommunities.filter(
    (c) => c.memberCount >= 100
  ).length;

  // Check active communities with contributions
  const activeCommunitiesWithContributions = await prisma.communityMember.count({
    where: {
      userId,
      community: {
        projects: {
          some: {
            project: {
              allocations: { some: { userId } },
            },
          },
        },
      },
    },
  });

  return {
    adCount,
    contributionCount,
    projectsFunded: projectsFunded.length,
    projectsCascaded: projectsCascaded.filter((p) => p.project.status === "funded").length,
    communitiesJoined,
    communitiesCreatedWith100Members,
    referralsActivated,
    commentCount,
    proposalsApproved,
    sharesWithBackers: 0, // Would need share tracking enhancement
    impactUpdatesReceived,
    consecutiveMonthsContributing: consecutiveMonths,
    streakDays: streak?.currentDays ?? 0,
    hasProfileComplete: !!(user?.bio && user?.avatarUrl),
    ralliesSuccessful: 0, // Would need rally tracking
    totalFundingFromProposals: 0, // Would need calculation
    activeCommunitiesWithContributions,
  };
}

/**
 * Check if user qualifies for a specific badge.
 */
function checkBadgeEligibility(stats: UserStats, badgeKey: BadgeKey): boolean {
  switch (badgeKey) {
    // Tier 1
    case "first_drop":
      return stats.contributionCount >= 1;
    case "community_member":
      return stats.communitiesJoined >= 1;
    case "profile_complete":
      return stats.hasProfileComplete;
    case "time_giver":
      return stats.adCount >= 1;
    case "first_referral":
      return stats.referralsActivated >= 1;

    // Tier 2
    case "steady_flow":
      return stats.consecutiveMonthsContributing >= 3;
    case "promoter":
      return stats.sharesWithBackers >= 5;
    case "proposer":
      return stats.proposalsApproved >= 1;
    case "conversationalist":
      return stats.commentCount >= 10;
    case "week_streak":
      return stats.streakDays >= 7;

    // Tier 3
    case "project_backer_x10":
      return stats.projectsFunded >= 10;
    case "social_butterfly":
      return stats.referralsActivated >= 3;
    case "storyteller":
      return false; // Needs share tracking
    case "month_streak":
      return stats.streakDays >= 30;
    case "first_cascade":
      return stats.projectsCascaded >= 1;

    // Tier 4
    case "community_builder":
      return stats.communitiesCreatedWith100Members >= 1;
    case "serial_proposer":
      return stats.proposalsApproved >= 3;
    case "impact_witness":
      return stats.impactUpdatesReceived >= 5;
    case "rallier":
      return stats.ralliesSuccessful >= 1;
    case "six_month_flow":
      return stats.consecutiveMonthsContributing >= 6;

    // Tier 5
    case "movement_builder":
      return stats.referralsActivated >= 25;
    case "cascade_veteran":
      return stats.projectsCascaded >= 10;
    case "catalyst":
      return stats.totalFundingFromProposals >= 10000;
    case "year_of_flow":
      return stats.consecutiveMonthsContributing >= 12;
    case "community_pillar":
      return stats.activeCommunitiesWithContributions >= 5;

    default:
      return false;
  }
}

/**
 * Get current progress value for a badge.
 */
function getBadgeProgress(stats: UserStats, badgeKey: BadgeKey): number {
  switch (badgeKey) {
    case "first_drop":
      return stats.contributionCount;
    case "community_member":
      return stats.communitiesJoined;
    case "profile_complete":
      return stats.hasProfileComplete ? 1 : 0;
    case "time_giver":
      return stats.adCount;
    case "first_referral":
      return stats.referralsActivated;
    case "steady_flow":
      return stats.consecutiveMonthsContributing;
    case "promoter":
      return stats.sharesWithBackers;
    case "proposer":
      return stats.proposalsApproved;
    case "conversationalist":
      return stats.commentCount;
    case "week_streak":
      return stats.streakDays;
    case "project_backer_x10":
      return stats.projectsFunded;
    case "social_butterfly":
      return stats.referralsActivated;
    case "storyteller":
      return 0;
    case "month_streak":
      return stats.streakDays;
    case "first_cascade":
      return stats.projectsCascaded;
    case "community_builder":
      return stats.communitiesCreatedWith100Members;
    case "serial_proposer":
      return stats.proposalsApproved;
    case "impact_witness":
      return stats.impactUpdatesReceived;
    case "rallier":
      return stats.ralliesSuccessful;
    case "six_month_flow":
      return stats.consecutiveMonthsContributing;
    case "movement_builder":
      return stats.referralsActivated;
    case "cascade_veteran":
      return stats.projectsCascaded;
    case "catalyst":
      return stats.totalFundingFromProposals;
    case "year_of_flow":
      return stats.consecutiveMonthsContributing;
    case "community_pillar":
      return stats.activeCommunitiesWithContributions;
    default:
      return 0;
  }
}

/**
 * Check all badges for a user and award any newly earned.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const stats = await getUserStats(userId);

  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });
  const earnedKeys = new Set(existingBadges.map((ub) => ub.badge.key));

  const newBadges: string[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earnedKeys.has(def.key)) continue;
    if (!checkBadgeEligibility(stats, def.key)) continue;

    const badge = await prisma.badge.findUnique({
      where: { key: def.key },
    });

    if (!badge) {
      // Create badge if it doesn't exist
      const newBadge = await prisma.badge.create({
        data: {
          key: def.key,
          name: def.name,
          description: def.description,
          tier: String(def.tier),
          icon: def.icon,
        },
      });

      await prisma.userBadge.create({
        data: { userId, badgeId: newBadge.id },
      });
    } else {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
    }

    newBadges.push(def.name);
    notifyBadgeEarned(userId, def.name).catch(() => {});
  }

  // Update progress for all badges
  await updateAllBadgeProgress(userId, stats);

  return newBadges;
}

/**
 * Update progress for all in-progress badges.
 */
async function updateAllBadgeProgress(userId: string, stats: UserStats) {
  const earnedKeys = new Set(
    (await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    })).map((ub) => ub.badge.key)
  );

  for (const def of BADGE_DEFINITIONS) {
    if (earnedKeys.has(def.key)) continue;

    const currentValue = getBadgeProgress(stats, def.key);

    await prisma.badgeProgress.upsert({
      where: { userId_badgeKey: { userId, badgeKey: def.key } },
      update: { currentValue },
      create: {
        userId,
        badgeKey: def.key,
        currentValue,
        targetValue: def.target,
      },
    });
  }
}

/**
 * Get user's badge progress.
 */
export async function getUserBadgeProgress(userId: string) {
  const [progress, earned] = await Promise.all([
    prisma.badgeProgress.findMany({ where: { userId } }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    }),
  ]);

  const earnedKeys = new Set(earned.map((e) => e.badge.key));

  return BADGE_DEFINITIONS.map((def) => {
    const isEarned = earnedKeys.has(def.key);
    const prog = progress.find((p) => p.badgeKey === def.key);

    return {
      ...def,
      earned: isEarned,
      earnedAt: earned.find((e) => e.badge.key === def.key)?.earnedAt,
      currentValue: isEarned ? def.target : (prog?.currentValue ?? 0),
      targetValue: def.target,
      progress: isEarned ? 100 : Math.min(100, ((prog?.currentValue ?? 0) / def.target) * 100),
    };
  });
}

/**
 * Get badges closest to being earned.
 */
export async function getNextBadges(userId: string, limit: number = 3) {
  const allProgress = await getUserBadgeProgress(userId);

  return allProgress
    .filter((b) => !b.earned && b.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
}

/**
 * Set featured badges for profile display.
 */
export async function setFeaturedBadges(userId: string, badgeIds: string[]) {
  // Unfeature all
  await prisma.userBadge.updateMany({
    where: { userId },
    data: { featured: false },
  });

  // Feature selected (max 3)
  const toFeature = badgeIds.slice(0, 3);
  await prisma.userBadge.updateMany({
    where: { userId, badgeId: { in: toFeature } },
    data: { featured: true },
  });
}

/**
 * Get featured badges for a user.
 */
export async function getFeaturedBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId, featured: true },
    include: { badge: true },
    take: 3,
  });
}
