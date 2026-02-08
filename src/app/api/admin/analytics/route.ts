import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPendingRevenueSummary } from "@/lib/settlement";
import { getPlatformOverview, getMetricHistory } from "@/lib/analytics/metrics";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Revenue metrics
  const revenueAgg = await prisma.adView.aggregate({
    _sum: {
      platformCut: true,
      watershedCredit: true,
    },
    _count: { id: true },
  });

  const totalRevenue = Math.round((revenueAgg._sum.platformCut || 0) * 100) / 100;
  const totalWatershedCredits =
    Math.round((revenueAgg._sum.watershedCredit || 0) * 100) / 100;
  const totalAdViews = revenueAgg._count.id;

  // Active users
  const activeUsers7dResult = await prisma.adView.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const activeUsers7d = activeUsers7dResult.length;

  const activeUsers30dResult = await prisma.adView.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const activeUsers30d = activeUsers30dResult.length;

  // Ad views by day (for charts)
  const adViewsByDay: { label: string; value: number }[] = [];
  const chartDays = Math.min(days, 60);
  for (let i = chartDays - 1; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = await prisma.adView.count({
      where: {
        createdAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    });

    const label = dayStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    adViewsByDay.push({ label, value: count });
  }

  // Loan stats
  const loanStats = {
    total: await prisma.loan.count(),
    active: await prisma.loan.count({
      where: { status: { in: ["funding", "active", "repaying"] } },
    }),
    completed: await prisma.loan.count({ where: { status: "completed" } }),
    expired: await prisma.loan.count({
      where: { status: { in: ["defaulted", "expired"] } },
    }),
    totalAmount:
      Math.round(
        (
          (
            await prisma.loan.aggregate({ _sum: { amount: true } })
          )._sum.amount || 0
        ) * 100
      ) / 100,
  };

  // Project stats
  const projectStats = {
    total: await prisma.project.count(),
    active: await prisma.project.count({ where: { status: "active" } }),
    funded: await prisma.project.count({ where: { status: "funded" } }),
  };

  // Referral stats
  const totalReferrals = await prisma.referral.count();
  const activatedReferrals = await prisma.referral.count({
    where: { status: "activated" },
  });
  const referralStats = {
    total: totalReferrals,
    activated: activatedReferrals,
    conversionRate:
      totalReferrals > 0
        ? Math.round((activatedReferrals / totalReferrals) * 100)
        : 0,
  };

  // Community stats
  const communityCount = await prisma.community.count();
  const communityAgg = await prisma.community.aggregate({
    _avg: { memberCount: true },
  });
  const communityStats = {
    total: communityCount,
    avgMembers: Math.round((communityAgg._avg.memberCount || 0) * 10) / 10,
  };

  // Avg completion rate
  const completionAgg = await prisma.adView.aggregate({
    _avg: { completionRate: true },
  });
  const avgCompletionRate = Math.round(
    (completionAgg._avg.completionRate || 0) * 100
  );

  // Total contributions
  const contributionAgg = await prisma.contribution.aggregate({
    _sum: { watershedCredit: true },
  });
  const totalContributions =
    Math.round((contributionAgg._sum.watershedCredit || 0) * 100) / 100;

  // Pending vs cleared revenue breakdown
  const revenueBreakdown = await getPendingRevenueSummary();

  // Platform overview for analytics dashboard
  const overview = await getPlatformOverview();
  const activeUserHistory = await getMetricHistory('daily_active_users', 'daily', 30);

  return NextResponse.json({
    totalRevenue,
    totalWatershedCredits,
    activeUsers7d,
    activeUsers30d,
    totalAdViews,
    adViewsByDay,
    loanStats,
    projectStats,
    referralStats,
    communityStats,
    avgCompletionRate,
    totalContributions,
    revenueBreakdown,
    overview,
    activeUserHistory,
  });
}
