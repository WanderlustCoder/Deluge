import { prisma } from "@/lib/prisma";

/**
 * Get all descendant community IDs for a community (recursive)
 */
export async function getDescendantIds(communityId: string): Promise<string[]> {
  const children = await prisma.community.findMany({
    where: { parentId: communityId },
    select: { id: true },
  });

  const descendantIds: string[] = [];
  for (const child of children) {
    descendantIds.push(child.id);
    const grandchildren = await getDescendantIds(child.id);
    descendantIds.push(...grandchildren);
  }

  return descendantIds;
}

/**
 * Get all ancestor community IDs for a community (up to root)
 */
export async function getAncestorIds(communityId: string): Promise<string[]> {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { parentId: true },
  });

  if (!community?.parentId) {
    return [];
  }

  const ancestors = await getAncestorIds(community.parentId);
  return [community.parentId, ...ancestors];
}

/**
 * Get aggregated stats for a community including all descendants
 */
export async function getAggregatedStats(communityId: string) {
  const descendants = await getDescendantIds(communityId);
  const allCommunityIds = [communityId, ...descendants];

  // Get all project IDs linked to these communities
  const communityProjects = await prisma.communityProject.findMany({
    where: { communityId: { in: allCommunityIds } },
    select: { projectId: true },
  });
  const projectIds = [...new Set(communityProjects.map((cp) => cp.projectId))];

  // Aggregate stats from Allocation and Project
  const [
    totalFunded,
    projectsCompleted,
    activeCampaigns,
    memberCount,
    backerCount,
  ] = await Promise.all([
    // Total funded across all linked projects
    prisma.allocation.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { amount: true },
    }),
    // Projects completed (status = 'completed' or 'funded')
    prisma.project.count({
      where: {
        id: { in: projectIds },
        status: { in: ["completed", "funded"] },
      },
    }),
    // Active campaigns
    prisma.project.count({
      where: {
        id: { in: projectIds },
        status: "active",
      },
    }),
    // Total unique members across all communities
    prisma.communityMember.groupBy({
      by: ["userId"],
      where: { communityId: { in: allCommunityIds } },
    }),
    // Total unique backers across all projects
    prisma.allocation.groupBy({
      by: ["userId"],
      where: { projectId: { in: projectIds } },
    }),
  ]);

  return {
    totalFunded: totalFunded._sum.amount || 0,
    projectsCompleted,
    activeCampaigns,
    memberCount: memberCount.length,
    backerCount: backerCount.length,
    projectCount: projectIds.length,
    subCommunityCount: descendants.length,
  };
}

/**
 * Get community stats for a single community (no aggregation)
 */
export async function getCommunityStats(communityId: string) {
  // Get project IDs linked to this community
  const communityProjects = await prisma.communityProject.findMany({
    where: { communityId },
    select: { projectId: true },
  });
  const projectIds = communityProjects.map((cp) => cp.projectId);

  const [totalFunded, projectsCompleted, activeCampaigns, memberCount] =
    await Promise.all([
      prisma.allocation.aggregate({
        where: { projectId: { in: projectIds } },
        _sum: { amount: true },
      }),
      prisma.project.count({
        where: {
          id: { in: projectIds },
          status: { in: ["completed", "funded"] },
        },
      }),
      prisma.project.count({
        where: {
          id: { in: projectIds },
          status: "active",
        },
      }),
      prisma.communityMember.count({
        where: { communityId },
      }),
    ]);

  return {
    totalFunded: totalFunded._sum.amount || 0,
    projectsCompleted,
    activeCampaigns,
    memberCount,
    projectCount: projectIds.length,
  };
}
