import { prisma } from "@/lib/prisma";

export type ChallengeMetric = "funding_amount" | "projects_funded";

/**
 * Get all challenges with entry data
 */
export async function getChallenges(status?: string) {
  const where = status ? { status } : {};

  const challenges = await prisma.communityChallenge.findMany({
    where,
    orderBy: [{ status: "asc" }, { startDate: "asc" }],
    include: {
      entries: true,
    },
  });

  return challenges;
}

/**
 * Get a single challenge with community details
 */
export async function getChallenge(challengeId: string) {
  const challenge = await prisma.communityChallenge.findUnique({
    where: { id: challengeId },
    include: {
      entries: true,
    },
  });

  if (!challenge) return null;

  // Get community details for each entry
  const communityIds = challenge.entries.map((e) => e.communityId);
  const communities = await prisma.community.findMany({
    where: { id: { in: communityIds } },
    select: { id: true, name: true, memberCount: true },
  });

  const communityMap = new Map(communities.map((c) => [c.id, c]));

  const entriesWithCommunities = challenge.entries
    .map((entry) => ({
      ...entry,
      community: communityMap.get(entry.communityId),
    }))
    .sort((a, b) => b.currentValue - a.currentValue); // Sort by value descending

  return {
    ...challenge,
    entries: entriesWithCommunities,
  };
}

/**
 * Join a community to a challenge
 */
export async function joinChallenge(challengeId: string, communityId: string) {
  // Check challenge exists and is active
  const challenge = await prisma.communityChallenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge || challenge.status !== "active") {
    throw new Error("Challenge not found or not active");
  }

  // Check if already joined
  const existing = await prisma.challengeEntry.findUnique({
    where: {
      challengeId_communityId: { challengeId, communityId },
    },
  });

  if (existing) {
    throw new Error("Community already joined this challenge");
  }

  // Get initial value based on metric
  const initialValue = await calculateChallengeValue(
    communityId,
    challenge.metric as ChallengeMetric,
    challenge.startDate
  );

  return prisma.challengeEntry.create({
    data: {
      challengeId,
      communityId,
      currentValue: initialValue,
    },
  });
}

/**
 * Update challenge entries for a community after funding
 */
export async function updateChallengeProgress(
  communityId: string,
  fundingAmount: number
) {
  // Find active challenges this community is participating in
  const entries = await prisma.challengeEntry.findMany({
    where: { communityId },
    include: {
      challenge: {
        select: { status: true, metric: true },
      },
    },
  });

  for (const entry of entries) {
    if (entry.challenge.status !== "active") continue;

    let increment = 0;
    if (entry.challenge.metric === "funding_amount") {
      increment = fundingAmount;
    } else if (entry.challenge.metric === "projects_funded") {
      increment = 1; // Count projects, not amount
    }

    if (increment > 0) {
      await prisma.challengeEntry.update({
        where: { id: entry.id },
        data: {
          currentValue: { increment },
        },
      });
    }
  }
}

/**
 * Calculate challenge value for a community
 */
async function calculateChallengeValue(
  communityId: string,
  metric: ChallengeMetric,
  sinceDate: Date
): Promise<number> {
  // Get project IDs for this community
  const communityProjects = await prisma.communityProject.findMany({
    where: { communityId },
    select: { projectId: true },
  });
  const projectIds = communityProjects.map((cp) => cp.projectId);

  if (metric === "funding_amount") {
    const result = await prisma.allocation.aggregate({
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: sinceDate },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  if (metric === "projects_funded") {
    const count = await prisma.allocation.groupBy({
      by: ["projectId"],
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: sinceDate },
      },
    });
    return count.length;
  }

  return 0;
}

/**
 * Complete expired challenges
 */
export async function completeExpiredChallenges() {
  const now = new Date();

  await prisma.communityChallenge.updateMany({
    where: {
      status: "active",
      endDate: { lt: now },
    },
    data: {
      status: "completed",
    },
  });
}
