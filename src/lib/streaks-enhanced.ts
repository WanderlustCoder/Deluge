import { prisma } from "@/lib/prisma";

export type StreakType = "ad_watch" | "contributing" | "login";

const GRACE_PERIOD_HOURS = 48;

/**
 * Record activity for a streak type.
 */
export async function recordActivity(userId: string, type: StreakType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (!streak) {
    // Create new streak
    return prisma.streak.create({
      data: {
        userId,
        type,
        currentDays: 1,
        longestDays: 1,
        lastActiveDate: today,
        gracePeriodUsed: false,
      },
    });
  }

  const lastActive = streak.lastActiveDate
    ? new Date(streak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  // Already active today
  if (lastActive && lastActive.getTime() === today.getTime()) {
    return streak;
  }

  // Check if consecutive (yesterday)
  if (lastActive && lastActive.getTime() === yesterday.getTime()) {
    const newDays = streak.currentDays + 1;
    return prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentDays: newDays,
        longestDays: Math.max(newDays, streak.longestDays),
        lastActiveDate: today,
        gracePeriodUsed: false,
        graceExpiresAt: null,
      },
    });
  }

  // Check if within grace period (2 days ago and grace not used)
  if (
    lastActive &&
    lastActive.getTime() === twoDaysAgo.getTime() &&
    !streak.gracePeriodUsed
  ) {
    // Auto-use grace period to continue streak
    const newDays = streak.currentDays + 1;
    return prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentDays: newDays,
        longestDays: Math.max(newDays, streak.longestDays),
        lastActiveDate: today,
        gracePeriodUsed: true,
        graceExpiresAt: null,
      },
    });
  }

  // Streak broken, reset
  return prisma.streak.update({
    where: { id: streak.id },
    data: {
      currentDays: 1,
      longestDays: Math.max(1, streak.longestDays),
      lastActiveDate: today,
      gracePeriodUsed: false,
      graceExpiresAt: null,
    },
  });
}

/**
 * Get streak status for a user.
 */
export async function getStreakStatus(userId: string, type: StreakType) {
  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (!streak) {
    return {
      currentDays: 0,
      longestDays: 0,
      isActive: false,
      needsActivity: true,
      gracePeriodAvailable: false,
      graceExpiresAt: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const lastActive = streak.lastActiveDate
    ? new Date(streak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  const isActiveToday = lastActive && lastActive.getTime() === today.getTime();
  const wasActiveYesterday = lastActive && lastActive.getTime() === yesterday.getTime();
  const wasActiveTwoDaysAgo = lastActive && lastActive.getTime() === twoDaysAgo.getTime();

  // Calculate if grace period is available
  let gracePeriodAvailable = false;
  let graceExpiresAt: Date | null = null;

  if (wasActiveYesterday && !isActiveToday) {
    // Streak is at risk but not broken yet
    gracePeriodAvailable = !streak.gracePeriodUsed;
    if (gracePeriodAvailable) {
      graceExpiresAt = new Date(lastActive!);
      graceExpiresAt.setDate(graceExpiresAt.getDate() + 2);
      graceExpiresAt.setHours(23, 59, 59, 999);
    }
  } else if (wasActiveTwoDaysAgo && !streak.gracePeriodUsed) {
    // In grace window
    gracePeriodAvailable = true;
    graceExpiresAt = new Date(lastActive!);
    graceExpiresAt.setDate(graceExpiresAt.getDate() + 2);
    graceExpiresAt.setHours(23, 59, 59, 999);
  }

  // Determine if streak is still valid
  const streakValid =
    isActiveToday ||
    wasActiveYesterday ||
    (wasActiveTwoDaysAgo && !streak.gracePeriodUsed);

  return {
    currentDays: streakValid ? streak.currentDays : 0,
    longestDays: streak.longestDays,
    isActive: isActiveToday,
    needsActivity: !isActiveToday && streakValid,
    gracePeriodAvailable,
    graceExpiresAt,
    gracePeriodUsed: streak.gracePeriodUsed,
    lastActiveDate: streak.lastActiveDate,
  };
}

/**
 * Manually use grace period to recover streak.
 */
export async function applyGracePeriod(userId: string, type: StreakType) {
  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (!streak) {
    throw new Error("No streak found");
  }

  if (streak.gracePeriodUsed) {
    throw new Error("Grace period already used this streak");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const lastActive = streak.lastActiveDate
    ? new Date(streak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  // Can only use grace if last active was 1-2 days ago
  const canUseGrace =
    lastActive &&
    (lastActive.getTime() === yesterday.getTime() ||
      lastActive.getTime() === twoDaysAgo.getTime());

  if (!canUseGrace) {
    throw new Error("Streak has been broken - grace period cannot be used");
  }

  // Mark grace as used (streak continues with gap)
  return prisma.streak.update({
    where: { id: streak.id },
    data: {
      gracePeriodUsed: true,
    },
  });
}

/**
 * Get all streaks for a user.
 */
export async function getAllStreaks(userId: string) {
  const types: StreakType[] = ["ad_watch", "contributing", "login"];
  const results: Record<StreakType, Awaited<ReturnType<typeof getStreakStatus>>> =
    {} as Record<StreakType, Awaited<ReturnType<typeof getStreakStatus>>>;

  for (const type of types) {
    results[type] = await getStreakStatus(userId, type);
  }

  return results;
}

/**
 * Check and award streak badges.
 */
export async function checkStreakBadges(userId: string, type: StreakType) {
  const status = await getStreakStatus(userId, type);

  // This integrates with the badge system
  // The checkAndAwardBadges function in badges-full.ts handles this
  return status;
}
