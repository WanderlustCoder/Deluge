import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { simulateAdRevenue, DAILY_AD_CAP } from "@/lib/constants";
import { checkFirstActionReferral } from "@/lib/referrals";
import { checkAndAwardBadges, updateAdStreak } from "@/lib/badges";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Parse completion rate from body (0-1, default 1)
  let completionRate = 1;
  try {
    const body = await request.json();
    if (typeof body.completionRate === "number") {
      completionRate = Math.max(0, Math.min(1, body.completionRate));
    }
  } catch {
    // No body or invalid JSON — default to full completion
  }

  // Check daily cap
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await prisma.adView.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });

  if (todayCount >= DAILY_AD_CAP) {
    return NextResponse.json(
      { error: "Daily ad limit reached. Come back tomorrow!" },
      { status: 429 }
    );
  }

  // Get or create watershed
  let watershed = await prisma.watershed.findUnique({
    where: { userId },
  });

  if (!watershed) {
    watershed = await prisma.watershed.create({
      data: { userId },
    });
  }

  // Simulate variable ad revenue scaled by completion rate
  const adRevenue = simulateAdRevenue(completionRate);

  // Record ad view and credit watershed in a transaction
  const newBalance = watershed.balance + adRevenue.watershedCredit;
  const newInflow = watershed.totalInflow + adRevenue.watershedCredit;

  await prisma.$transaction([
    prisma.adView.create({
      data: {
        userId,
        grossRevenue: adRevenue.grossRevenue,
        platformCut: adRevenue.platformCut,
        watershedCredit: adRevenue.watershedCredit,
        completionRate,
      },
    }),
    prisma.watershed.update({
      where: { userId },
      data: {
        balance: newBalance,
        totalInflow: newInflow,
      },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        type: "ad_credit",
        amount: adRevenue.watershedCredit,
        description: "Ad view credit",
        balanceAfter: newBalance,
      },
    }),
  ]);

  // Update streak + check badges + referral milestone (non-blocking)
  await updateAdStreak(userId);
  const newBadges = await checkAndAwardBadges(userId);
  checkFirstActionReferral(userId).catch(() => {});

  return NextResponse.json({
    success: true,
    data: {
      credit: adRevenue.watershedCredit,
      newBalance,
      adsToday: todayCount + 1,
      remaining: DAILY_AD_CAP - (todayCount + 1),
      completionRate,
      newBadges,
    },
  });
}

// GET: fetch today's ad count
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await prisma.adView.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: startOfDay },
    },
  });

  const watershed = await prisma.watershed.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(
    {
      adsToday: todayCount,
      remaining: DAILY_AD_CAP - todayCount,
      balance: watershed?.balance ?? 0,
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
