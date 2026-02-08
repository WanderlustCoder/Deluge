import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserBadgeProgress, BADGE_TIERS, getNextBadges } from "@/lib/badges-full";
import { getStreakStatus } from "@/lib/streaks-enhanced";
import { logError } from "@/lib/logger";

// GET: Get all badges with user's progress/status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [progress, streak, nextBadges] = await Promise.all([
      getUserBadgeProgress(session.user.id),
      getStreakStatus(session.user.id, "ad_watch"),
      getNextBadges(session.user.id, 3),
    ]);

    // Group by tier
    const byTier: Record<number, typeof progress> = {};
    for (const badge of progress) {
      if (!byTier[badge.tier]) {
        byTier[badge.tier] = [];
      }
      byTier[badge.tier].push(badge);
    }

    // Calculate summary stats
    const earnedCount = progress.filter((b) => b.earned).length;
    const totalCount = progress.length;
    const earnedByTier: Record<number, number> = {};
    const totalByTier: Record<number, number> = {};

    for (const badge of progress) {
      totalByTier[badge.tier] = (totalByTier[badge.tier] || 0) + 1;
      if (badge.earned) {
        earnedByTier[badge.tier] = (earnedByTier[badge.tier] || 0) + 1;
      }
    }

    return NextResponse.json({
      badges: progress,
      byTier,
      tiers: BADGE_TIERS,
      nextBadges,
      streak: {
        currentDays: streak.currentDays,
        longestDays: streak.longestDays,
        isActive: streak.isActive,
        needsActivity: streak.needsActivity,
        gracePeriodAvailable: streak.gracePeriodAvailable,
        graceExpiresAt: streak.graceExpiresAt,
      },
      summary: {
        earned: earnedCount,
        total: totalCount,
        earnedByTier,
        totalByTier,
      },
    });
  } catch (error) {
    logError("api/badges", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
