import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [allBadges, userBadges, streak] = await Promise.all([
    prisma.badge.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
    }),
    prisma.streak.findUnique({
      where: {
        userId_type: { userId: session.user.id, type: "ad_watch" },
      },
    }),
  ]);

  const earnedKeys = new Set(userBadges.map((ub) => ub.badge.key));

  const badges = allBadges.map((badge) => ({
    ...badge,
    earned: earnedKeys.has(badge.key),
    earnedAt: userBadges.find((ub) => ub.badge.key === badge.key)?.earnedAt,
  }));

  return NextResponse.json({
    badges,
    streak: streak
      ? {
          currentDays: streak.currentDays,
          longestDays: streak.longestDays,
          lastActiveDate: streak.lastActiveDate,
        }
      : { currentDays: 0, longestDays: 0, lastActiveDate: null },
  });
}
