import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Community progress API - replaces individual leaderboards
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Platform-wide stats
  const [
    totalUsers,
    totalProjects,
    projectsFunded,
    totalLoans,
    loansFunded,
    totalWatershedBalance,
    totalAdsWatched,
    totalCommunities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: "funded" } }),
    prisma.loan.count(),
    prisma.loan.count({ where: { status: "funded" } }),
    prisma.watershed.aggregate({ _sum: { totalInflow: true } }),
    prisma.adView.count(),
    prisma.community.count(),
  ]);

  // This month's activity
  const [
    projectsFundedThisMonth,
    loansFundedThisMonth,
    newUsersThisMonth,
    adsThisMonth,
  ] = await Promise.all([
    prisma.project.count({
      where: { status: "funded", updatedAt: { gte: monthStart } },
    }),
    prisma.loan.count({
      where: {
        status: { in: ["funded", "active", "repaying", "completed"] },
        updatedAt: { gte: monthStart },
        sharesRemaining: 0,
      },
    }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.adView.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  // Top communities by impact (projects funded by members)
  const communityStats = await prisma.community.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { members: true },
      },
    },
    orderBy: { members: { _count: "desc" } },
    take: 10,
  });

  // Get project funding by community members
  const communitiesWithImpact = await Promise.all(
    communityStats.map(async (community) => {
      const memberIds = await prisma.communityMember.findMany({
        where: { communityId: community.id },
        select: { userId: true },
      });
      const userIds = memberIds.map((m) => m.userId);

      const [projectsBacked, loansSupported] = await Promise.all([
        prisma.allocation.groupBy({
          by: ["projectId"],
          where: { userId: { in: userIds } },
        }),
        prisma.loanShare.groupBy({
          by: ["loanId"],
          where: { funderId: { in: userIds } },
        }),
      ]);

      return {
        id: community.id,
        name: community.name,
        memberCount: community._count.members,
        projectsBacked: projectsBacked.length,
        loansSupported: loansSupported.length,
      };
    })
  );

  // Sort by total impact (projects + loans)
  const topCommunities = communitiesWithImpact
    .sort(
      (a, b) =>
        b.projectsBacked + b.loansSupported - (a.projectsBacked + a.loansSupported)
    )
    .slice(0, 5);

  // User's personal progress (private, not ranked)
  const [
    userAdsTotal,
    userAdsMonth,
    userProjectsBacked,
    userLoansFunded,
    userStreak,
    userBadges,
    userCommunities,
  ] = await Promise.all([
    prisma.adView.count({ where: { userId: session.user.id } }),
    prisma.adView.count({
      where: { userId: session.user.id, createdAt: { gte: monthStart } },
    }),
    prisma.allocation.groupBy({
      by: ["projectId"],
      where: { userId: session.user.id },
    }),
    prisma.loanShare.groupBy({
      by: ["loanId"],
      where: { funderId: session.user.id },
    }),
    prisma.streak.findUnique({
      where: { userId_type: { userId: session.user.id, type: "ad_watch" } },
    }),
    prisma.userBadge.count({ where: { userId: session.user.id } }),
    prisma.communityMember.count({ where: { userId: session.user.id } }),
  ]);

  const userWatershed = await prisma.watershed.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    platform: {
      totalUsers,
      totalProjects,
      projectsFunded,
      totalLoans,
      loansFunded,
      totalWatershedFlow: Math.round((totalWatershedBalance._sum.totalInflow || 0) * 100) / 100,
      totalAdsWatched,
      totalCommunities,
    },
    thisMonth: {
      projectsFunded: projectsFundedThisMonth,
      loansFunded: loansFundedThisMonth,
      newMembers: newUsersThisMonth,
      adsWatched: adsThisMonth,
    },
    topCommunities,
    yourProgress: {
      adsWatchedTotal: userAdsTotal,
      adsWatchedThisMonth: userAdsMonth,
      projectsBacked: userProjectsBacked.length,
      loansFunded: userLoansFunded.length,
      currentStreak: userStreak?.currentDays || 0,
      longestStreak: userStreak?.longestDays || 0,
      badgesEarned: userBadges,
      communitiesJoined: userCommunities,
      watershedBalance: userWatershed?.balance || 0,
      totalContributed: userWatershed?.totalOutflow || 0,
    },
  });
}
