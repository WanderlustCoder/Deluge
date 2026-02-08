// Discovery challenges - gamified exploration

import { prisma } from '@/lib/prisma';
import { checkAndAwardBadges } from '@/lib/badges';

export type ChallengeType =
  | 'explore_categories'
  | 'fund_new_community'
  | 'support_local'
  | 'diverse_giving'
  | 'first_project';

interface ChallengeDefinition {
  type: ChallengeType;
  title: string;
  description: string;
  target: number;
  reward: 'badge' | 'watershed_credit';
  rewardAmount?: number;
  durationDays: number;
}

const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  {
    type: 'explore_categories',
    title: 'Category Explorer',
    description: 'Fund projects in 3 different categories',
    target: 3,
    reward: 'badge',
    durationDays: 30,
  },
  {
    type: 'fund_new_community',
    title: 'Community Pioneer',
    description: 'Support a project in a community you haven\'t funded before',
    target: 1,
    reward: 'watershed_credit',
    rewardAmount: 0.50,
    durationDays: 14,
  },
  {
    type: 'support_local',
    title: 'Local Champion',
    description: 'Fund 5 projects in your local area',
    target: 5,
    reward: 'badge',
    durationDays: 60,
  },
  {
    type: 'diverse_giving',
    title: 'Diverse Giver',
    description: 'Support projects across 5 different communities',
    target: 5,
    reward: 'badge',
    durationDays: 90,
  },
  {
    type: 'first_project',
    title: 'First Steps',
    description: 'Fund your first project',
    target: 1,
    reward: 'watershed_credit',
    rewardAmount: 1.00,
    durationDays: 7,
  },
];

// Get active challenges for a user
export async function getActiveChallenges(userId: string) {
  return prisma.discoveryChallenge.findMany({
    where: {
      userId,
      status: 'active',
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: 'asc' },
  });
}

// Create a new challenge for a user
export async function createChallenge(
  userId: string,
  type: ChallengeType
): Promise<{ id: string } | null> {
  const definition = CHALLENGE_DEFINITIONS.find((d) => d.type === type);
  if (!definition) return null;

  // Check if user already has this challenge active
  const existing = await prisma.discoveryChallenge.findFirst({
    where: {
      userId,
      type,
      status: 'active',
    },
  });

  if (existing) return null;

  const challenge = await prisma.discoveryChallenge.create({
    data: {
      userId,
      type,
      target: definition.target,
      reward: definition.reward,
      rewardAmount: definition.rewardAmount,
      expiresAt: new Date(Date.now() + definition.durationDays * 24 * 60 * 60 * 1000),
    },
  });

  return { id: challenge.id };
}

// Update challenge progress
export async function updateChallengeProgress(
  userId: string,
  type: ChallengeType,
  increment: number = 1
): Promise<boolean> {
  const challenge = await prisma.discoveryChallenge.findFirst({
    where: {
      userId,
      type,
      status: 'active',
      expiresAt: { gt: new Date() },
    },
  });

  if (!challenge) return false;

  const newProgress = challenge.progress + increment;

  if (newProgress >= challenge.target) {
    // Challenge completed
    await prisma.discoveryChallenge.update({
      where: { id: challenge.id },
      data: {
        progress: challenge.target,
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Award reward
    await awardChallengeReward(userId, challenge);

    return true;
  } else {
    await prisma.discoveryChallenge.update({
      where: { id: challenge.id },
      data: { progress: newProgress },
    });

    return false;
  }
}

// Award challenge reward
async function awardChallengeReward(
  userId: string,
  challenge: { reward: string; rewardAmount: number | null }
): Promise<void> {
  if (challenge.reward === 'watershed_credit' && challenge.rewardAmount) {
    // Get current watershed
    const watershed = await prisma.watershed.findUnique({ where: { userId } });
    if (!watershed) return;

    const newBalance = watershed.balance + challenge.rewardAmount;

    // Add credit to watershed
    await prisma.watershed.update({
      where: { userId },
      data: {
        balance: { increment: challenge.rewardAmount },
        totalInflow: { increment: challenge.rewardAmount },
      },
    });

    // Log transaction
    await prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        amount: challenge.rewardAmount,
        type: 'bonus',
        description: 'Discovery challenge reward',
        balanceAfter: newBalance,
      },
    });
  }

  // Check for badges
  await checkAndAwardBadges(userId);
}

// Check and update challenges after funding
export async function checkChallengesAfterFunding(
  userId: string,
  projectId: string
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      communities: { select: { communityId: true } },
    },
  });

  if (!project) return;

  // Check explore_categories
  const userCategories = await prisma.allocation.findMany({
    where: { userId },
    include: { project: { select: { category: true } } },
    distinct: ['projectId'],
  });
  const uniqueCategories = new Set(userCategories.map((a) => a.project.category));
  if (uniqueCategories.size > 0) {
    const existingProgress = await prisma.discoveryChallenge.findFirst({
      where: { userId, type: 'explore_categories', status: 'active' },
    });
    if (existingProgress) {
      await prisma.discoveryChallenge.update({
        where: { id: existingProgress.id },
        data: { progress: uniqueCategories.size },
      });
      if (uniqueCategories.size >= existingProgress.target) {
        await updateChallengeProgress(userId, 'explore_categories', 0);
      }
    }
  }

  // Check fund_new_community
  const previousCommunities = await prisma.allocation.findMany({
    where: {
      userId,
      projectId: { not: projectId },
    },
    include: {
      project: {
        include: { communities: { select: { communityId: true } } },
      },
    },
  });
  const previousCommunityIds = new Set(
    previousCommunities.flatMap((a) => a.project.communities.map((c) => c.communityId))
  );
  const isNewCommunity = project.communities.some(
    (c) => !previousCommunityIds.has(c.communityId)
  );
  if (isNewCommunity) {
    await updateChallengeProgress(userId, 'fund_new_community');
  }

  // Check first_project
  const allocationCount = await prisma.allocation.count({ where: { userId } });
  if (allocationCount === 1) {
    await updateChallengeProgress(userId, 'first_project');
  }

  // Check diverse_giving
  const allCommunities = await prisma.allocation.findMany({
    where: { userId },
    include: {
      project: {
        include: { communities: { select: { communityId: true } } },
      },
    },
  });
  const uniqueCommunities = new Set(
    allCommunities.flatMap((a) => a.project.communities.map((c) => c.communityId))
  );
  const diverseChallenge = await prisma.discoveryChallenge.findFirst({
    where: { userId, type: 'diverse_giving', status: 'active' },
  });
  if (diverseChallenge) {
    await prisma.discoveryChallenge.update({
      where: { id: diverseChallenge.id },
      data: { progress: uniqueCommunities.size },
    });
    if (uniqueCommunities.size >= diverseChallenge.target) {
      await updateChallengeProgress(userId, 'diverse_giving', 0);
    }
  }
}

// Get suggested challenges for a user
export async function getSuggestedChallenges(
  userId: string
): Promise<ChallengeDefinition[]> {
  const activeChallenges = await getActiveChallenges(userId);
  const activeTypes = new Set(activeChallenges.map((c) => c.type));

  // Get completed challenges
  const completedChallenges = await prisma.discoveryChallenge.findMany({
    where: { userId, status: 'completed' },
    select: { type: true },
  });
  const completedTypes = new Set(completedChallenges.map((c) => c.type));

  // Return challenges that are neither active nor completed
  return CHALLENGE_DEFINITIONS.filter(
    (d) => !activeTypes.has(d.type) && !completedTypes.has(d.type)
  );
}

// Expire old challenges
export async function expireOldChallenges(): Promise<number> {
  const result = await prisma.discoveryChallenge.updateMany({
    where: {
      status: 'active',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'expired' },
  });

  return result.count;
}
