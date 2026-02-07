import { prisma } from "@/lib/prisma";
import { createFeedItem } from "@/lib/activity";
import { COMMUNITY_MILESTONES, MILESTONE_TYPES } from "@/lib/constants";

/**
 * Check and award milestones for a community
 * Called after funding, member joins, or project completions
 */
export async function checkAndAwardMilestones(communityId: string) {
  const awardedMilestones: string[] = [];

  // Get current community stats
  const [community, projectIds] = await Promise.all([
    prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, name: true, memberCount: true },
    }),
    prisma.communityProject
      .findMany({
        where: { communityId },
        select: { projectId: true },
      })
      .then((cps) => cps.map((cp) => cp.projectId)),
  ]);

  if (!community) return awardedMilestones;

  // Get total funding and completed projects
  const [totalFunding, completedProjects] = await Promise.all([
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
  ]);

  const stats = {
    funding: totalFunding._sum.amount || 0,
    members: community.memberCount,
    projects: completedProjects,
  };

  // Get already earned milestones
  const earnedMilestones = await prisma.communityMilestone.findMany({
    where: { communityId },
    select: { type: true },
  });
  const earnedTypes = new Set(earnedMilestones.map((m) => m.type));

  // Check funding milestones
  for (const threshold of COMMUNITY_MILESTONES.funding) {
    const type = MILESTONE_TYPES.funding(threshold);
    if (stats.funding >= threshold && !earnedTypes.has(type)) {
      await awardMilestone(communityId, type, community.name, "funding", threshold);
      awardedMilestones.push(type);
    }
  }

  // Check member milestones
  for (const threshold of COMMUNITY_MILESTONES.members) {
    const type = MILESTONE_TYPES.members(threshold);
    if (stats.members >= threshold && !earnedTypes.has(type)) {
      await awardMilestone(communityId, type, community.name, "members", threshold);
      awardedMilestones.push(type);
    }
  }

  // Check project milestones
  for (const threshold of COMMUNITY_MILESTONES.projects) {
    const type = MILESTONE_TYPES.projects(threshold);
    if (stats.projects >= threshold && !earnedTypes.has(type)) {
      await awardMilestone(communityId, type, community.name, "projects", threshold);
      awardedMilestones.push(type);
    }
  }

  return awardedMilestones;
}

async function awardMilestone(
  communityId: string,
  type: string,
  communityName: string,
  category: "funding" | "members" | "projects",
  threshold: number
) {
  await prisma.communityMilestone.create({
    data: { communityId, type },
  });

  // Create activity feed item
  const messages: Record<string, string> = {
    funding: `Our community reached $${threshold.toLocaleString()} in total funding!`,
    members: `We welcomed our ${threshold}${threshold === 100 ? "th" : ""} member!`,
    projects: `Together we've completed ${threshold} projects!`,
  };

  await createFeedItem(
    "milestone",
    "community",
    communityId,
    undefined,
    {
      milestoneType: type,
      category,
      threshold,
      communityName,
      message: messages[category],
    }
  );
}

/**
 * Get milestones for a community
 */
export async function getCommunityMilestones(communityId: string) {
  const milestones = await prisma.communityMilestone.findMany({
    where: { communityId },
    orderBy: { reachedAt: "desc" },
  });

  return milestones.map((m) => ({
    ...m,
    label: formatMilestoneLabel(m.type),
    icon: getMilestoneIcon(m.type),
  }));
}

function formatMilestoneLabel(type: string): string {
  if (type.startsWith("funding_")) {
    const amount = parseInt(type.replace("funding_", ""));
    return `$${amount.toLocaleString()} Funded`;
  }
  if (type.startsWith("members_")) {
    const count = parseInt(type.replace("members_", ""));
    return `${count} Members`;
  }
  if (type.startsWith("projects_")) {
    const count = parseInt(type.replace("projects_", ""));
    return `${count} Projects`;
  }
  return type;
}

function getMilestoneIcon(type: string): string {
  if (type.startsWith("funding_")) return "💰";
  if (type.startsWith("members_")) return "👥";
  if (type.startsWith("projects_")) return "🎯";
  return "🏆";
}
