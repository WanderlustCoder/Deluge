/**
 * Family Impact Tracking
 *
 * Combined impact stats and activity for families.
 */

import { prisma } from "@/lib/prisma";

/**
 * Get combined family impact
 */
export async function getFamilyImpact(familyId: string): Promise<{
  totalFunded: number;
  projectsSupported: number;
  loansContributed: number;
  adsWatched: number;
  memberBreakdown: {
    memberId: string;
    nickname: string | null;
    userName: string;
    totalFunded: number;
    projectsSupported: number;
  }[];
}> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!family) {
    throw new Error("Family not found");
  }

  const userIds = family.members.map((m) => m.userId);

  // Aggregate allocations
  const allocations = await prisma.allocation.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _sum: { amount: true },
    _count: { projectId: true },
  });

  // Aggregate loan shares
  const loanShares = await prisma.loanShare.aggregate({
    where: { funderId: { in: userIds } },
    _sum: { amount: true },
  });

  // Aggregate ad views
  const adViews = await prisma.adView.count({
    where: { userId: { in: userIds } },
  });

  // Build member breakdown
  const memberBreakdown = family.members.map((member) => {
    const allocation = allocations.find((a) => a.userId === member.userId);
    return {
      memberId: member.id,
      nickname: member.nickname,
      userName: member.user.name,
      totalFunded: allocation?._sum.amount || 0,
      projectsSupported: allocation?._count.projectId || 0,
    };
  });

  // Unique projects
  const uniqueProjects = await prisma.allocation.findMany({
    where: { userId: { in: userIds } },
    select: { projectId: true },
    distinct: ["projectId"],
  });

  return {
    totalFunded: allocations.reduce((sum, a) => sum + (a._sum.amount || 0), 0),
    projectsSupported: uniqueProjects.length,
    loansContributed: loanShares._sum.amount || 0,
    adsWatched: adViews,
    memberBreakdown,
  };
}

/**
 * Get family activity feed
 */
export async function getFamilyActivity(
  familyId: string,
  limit = 20
): Promise<
  {
    id: string;
    memberId: string;
    memberName: string;
    actionType: string;
    description: string;
    projectId: string | null;
    amount: number | null;
    createdAt: Date;
  }[]
> {
  const activities = await prisma.familyActivity.findMany({
    where: { familyId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Get member names
  const memberIds = [...new Set(activities.map((a) => a.memberId))];
  const members = await prisma.familyMember.findMany({
    where: { id: { in: memberIds } },
    include: { user: { select: { name: true } } },
  });

  const memberMap = new Map(
    members.map((m) => [m.id, m.nickname || m.user.name])
  );

  return activities.map((activity) => ({
    id: activity.id,
    memberId: activity.memberId,
    memberName: memberMap.get(activity.memberId) || "Unknown",
    actionType: activity.actionType,
    description: activity.description,
    projectId: activity.projectId,
    amount: activity.amount,
    createdAt: activity.createdAt,
  }));
}

/**
 * Get member contributions for comparison (no competitive ranking, just info)
 */
export async function getMemberContributions(familyId: string): Promise<
  {
    memberId: string;
    name: string;
    thisMonth: number;
    thisYear: number;
    allTime: number;
  }[]
> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!family) {
    throw new Error("Family not found");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const results = await Promise.all(
    family.members.map(async (member) => {
      const [thisMonth, thisYear, allTime] = await Promise.all([
        prisma.allocation.aggregate({
          where: { userId: member.userId, createdAt: { gte: monthStart } },
          _sum: { amount: true },
        }),
        prisma.allocation.aggregate({
          where: { userId: member.userId, createdAt: { gte: yearStart } },
          _sum: { amount: true },
        }),
        prisma.allocation.aggregate({
          where: { userId: member.userId },
          _sum: { amount: true },
        }),
      ]);

      return {
        memberId: member.id,
        name: member.nickname || member.user.name,
        thisMonth: thisMonth._sum.amount || 0,
        thisYear: thisYear._sum.amount || 0,
        allTime: allTime._sum.amount || 0,
      };
    })
  );

  return results;
}
