import { prisma } from "@/lib/prisma";

interface MatchResult {
  campaignId: string;
  campaignName: string;
  corporateName: string;
  matchRatio: number;
  matchAmount: number;
  logoUrl: string | null;
}

/**
 * Find applicable matching campaigns for a project and calculate match amounts
 */
export async function findMatchingCampaigns(
  projectId: string,
  projectCategory: string,
  fundingAmount: number
): Promise<MatchResult[]> {
  const now = new Date();

  // Find active campaigns that match this project
  const campaigns = await prisma.matchingCampaign.findMany({
    where: {
      status: "active",
      startsAt: { lte: now },
      endsAt: { gte: now },
      remainingBudget: { gt: 0 },
      OR: [
        { targetType: "all" },
        { targetType: "project", targetValue: projectId },
        { targetType: "category", targetValue: projectCategory },
      ],
    },
    orderBy: { matchRatio: "desc" }, // Prioritize higher match ratios
  });

  const results: MatchResult[] = [];

  for (const campaign of campaigns) {
    // Calculate potential match
    const potentialMatch = fundingAmount * (campaign.matchRatio - 1);
    const actualMatch = Math.min(potentialMatch, campaign.remainingBudget);

    if (actualMatch > 0) {
      results.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        corporateName: campaign.corporateName,
        matchRatio: campaign.matchRatio,
        matchAmount: actualMatch,
        logoUrl: campaign.logoUrl,
      });
    }
  }

  return results;
}

/**
 * Apply matching to a funding action and deduct from campaign budget
 */
export async function applyMatch(
  campaignId: string,
  userId: string,
  projectId: string,
  userAmount: number
): Promise<{ matchAmount: number } | null> {
  const campaign = await prisma.matchingCampaign.findUnique({
    where: { id: campaignId },
  });

  if (
    !campaign ||
    campaign.status !== "active" ||
    campaign.remainingBudget <= 0
  ) {
    return null;
  }

  const potentialMatch = userAmount * (campaign.matchRatio - 1);
  const actualMatch = Math.min(potentialMatch, campaign.remainingBudget);

  if (actualMatch <= 0) {
    return null;
  }

  // Record the match and deduct from campaign
  await prisma.$transaction([
    prisma.matchingContribution.create({
      data: {
        campaignId,
        userId,
        projectId,
        userAmount,
        matchAmount: actualMatch,
      },
    }),
    prisma.matchingCampaign.update({
      where: { id: campaignId },
      data: {
        remainingBudget: { decrement: actualMatch },
        // Mark as completed if budget exhausted
        status:
          campaign.remainingBudget - actualMatch <= 0 ? "completed" : "active",
      },
    }),
  ]);

  return { matchAmount: actualMatch };
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: string) {
  const campaign = await prisma.matchingCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) return null;

  const matches = await prisma.matchingContribution.aggregate({
    where: { campaignId },
    _sum: { userAmount: true, matchAmount: true },
    _count: true,
  });

  return {
    totalBudget: campaign.totalBudget,
    remainingBudget: campaign.remainingBudget,
    spent: campaign.totalBudget - campaign.remainingBudget,
    userContributions: matches._sum.userAmount || 0,
    matchContributions: matches._sum.matchAmount || 0,
    matchCount: matches._count,
  };
}
