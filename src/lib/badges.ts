import { prisma } from "@/lib/prisma";
import { notifyBadgeEarned } from "@/lib/notifications";

interface BadgeDef {
  key: string;
  check: (stats: UserStats) => boolean;
}

interface UserStats {
  adCount: number;
  fundCount: number; // distinct projects funded
  contributionCount: number;
  streakDays: number;
  volunteerHours: number; // verified volunteer hours
}

const BADGE_CHECKS: BadgeDef[] = [
  { key: "first_ad", check: (s) => s.adCount >= 1 },
  { key: "first_fund", check: (s) => s.fundCount >= 1 },
  { key: "first_contribution", check: (s) => s.contributionCount >= 1 },
  { key: "ads_10", check: (s) => s.adCount >= 10 },
  { key: "ads_100", check: (s) => s.adCount >= 100 },
  { key: "projects_3", check: (s) => s.fundCount >= 3 },
  { key: "projects_10", check: (s) => s.fundCount >= 10 },
  { key: "week_streak", check: (s) => s.streakDays >= 7 },
  { key: "month_streak", check: (s) => s.streakDays >= 30 },
  // Volunteer badges
  { key: "first_volunteer", check: (s) => s.volunteerHours >= 1 },
  { key: "volunteer_10", check: (s) => s.volunteerHours >= 10 },
  { key: "volunteer_50", check: (s) => s.volunteerHours >= 50 },
  { key: "volunteer_100", check: (s) => s.volunteerHours >= 100 },
];

/**
 * Check all badge criteria for a user and award any newly earned badges.
 * Returns an array of newly earned badge names.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // Get user stats
  const [adCount, projectsFunded, contributionCount, streak, volunteerLogs] =
    await Promise.all([
      prisma.adView.count({ where: { userId } }),
      prisma.allocation.groupBy({
        by: ["projectId"],
        where: { userId },
      }),
      prisma.contribution.count({ where: { userId } }),
      prisma.streak.findUnique({
        where: { userId_type: { userId, type: "ad_watch" } },
      }),
      prisma.volunteerLog.aggregate({
        where: { userId, verified: true },
        _sum: { hours: true },
      }),
    ]);

  const stats: UserStats = {
    adCount,
    fundCount: projectsFunded.length,
    contributionCount,
    streakDays: streak?.currentDays ?? 0,
    volunteerHours: volunteerLogs._sum?.hours ?? 0,
  };

  // Get user's existing badges
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });
  const earnedKeys = new Set(existingBadges.map((ub) => ub.badge.key));

  // Check which new badges the user qualifies for
  const newBadges: string[] = [];

  for (const check of BADGE_CHECKS) {
    if (earnedKeys.has(check.key)) continue;
    if (!check.check(stats)) continue;

    // Find badge definition
    const badge = await prisma.badge.findUnique({
      where: { key: check.key },
    });
    if (!badge) continue;

    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });

    newBadges.push(badge.name);
    notifyBadgeEarned(userId, badge.name).catch(() => {});
  }

  return newBadges;
}

/**
 * Update the ad watching streak for a user.
 * Call this after each ad view.
 */
export async function updateAdStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type: "ad_watch" } },
  });

  if (!streak) {
    streak = await prisma.streak.create({
      data: {
        userId,
        type: "ad_watch",
        currentDays: 1,
        longestDays: 1,
        lastActiveDate: today,
      },
    });
    return;
  }

  if (!streak.lastActiveDate) {
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentDays: 1,
        longestDays: Math.max(1, streak.longestDays),
        lastActiveDate: today,
      },
    });
    return;
  }

  const lastActive = new Date(streak.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  if (lastActive.getTime() === today.getTime()) {
    // Already active today, no-op
    return;
  }

  if (lastActive.getTime() === yesterday.getTime()) {
    // Consecutive day
    const newDays = streak.currentDays + 1;
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentDays: newDays,
        longestDays: Math.max(newDays, streak.longestDays),
        lastActiveDate: today,
      },
    });
  } else {
    // Streak broken, reset to 1
    await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentDays: 1,
        longestDays: Math.max(1, streak.longestDays),
        lastActiveDate: today,
      },
    });
  }
}
