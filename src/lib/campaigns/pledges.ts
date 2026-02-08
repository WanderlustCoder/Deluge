import { prisma } from '@/lib/prisma';
import { isCampaignSuccessful } from './index';

export interface CreatePledgeInput {
  campaignId: string;
  userId: string;
  amount: number;
  tipAmount?: number;
  rewardId?: string;
  paymentMethodId?: string;
  isAnonymous?: boolean;
  message?: string;
}

export interface UpdatePledgeInput {
  amount?: number;
  tipAmount?: number;
  rewardId?: string | null;
  isAnonymous?: boolean;
  message?: string;
}

// Create a new pledge
export async function createPledge(input: CreatePledgeInput) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id: input.campaignId },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'active') {
    throw new Error('Campaign is not accepting pledges');
  }

  if (new Date() > campaign.endDate) {
    throw new Error('Campaign has ended');
  }

  // Validate reward if provided
  if (input.rewardId) {
    const reward = await prisma.campaignReward.findFirst({
      where: {
        id: input.rewardId,
        campaignId: input.campaignId,
        isVisible: true,
      },
    });

    if (!reward) {
      throw new Error('Reward not found');
    }

    if (input.amount < reward.amount) {
      throw new Error(`Pledge amount must be at least $${reward.amount} for this reward`);
    }

    if (reward.quantity !== null && reward.claimed >= reward.quantity) {
      throw new Error('This reward is sold out');
    }
  }

  // Check if user already has an active pledge for this campaign
  const existingPledge = await prisma.pledge.findFirst({
    where: {
      campaignId: input.campaignId,
      userId: input.userId,
      status: 'active',
    },
  });

  if (existingPledge) {
    throw new Error('You already have an active pledge for this campaign. Please update your existing pledge.');
  }

  // Create the pledge
  const pledge = await prisma.$transaction(async (tx) => {
    const newPledge = await tx.pledge.create({
      data: {
        campaignId: input.campaignId,
        userId: input.userId,
        amount: input.amount,
        tipAmount: input.tipAmount || 0,
        rewardId: input.rewardId,
        paymentMethodId: input.paymentMethodId,
        isAnonymous: input.isAnonymous || false,
        message: input.message,
        status: 'active',
      },
      include: {
        campaign: true,
        reward: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Update campaign stats
    await tx.pledgeCampaign.update({
      where: { id: input.campaignId },
      data: {
        pledgedAmount: { increment: input.amount },
        backerCount: { increment: 1 },
      },
    });

    // Update reward claimed count
    if (input.rewardId) {
      await tx.campaignReward.update({
        where: { id: input.rewardId },
        data: { claimed: { increment: 1 } },
      });
    }

    return newPledge;
  });

  // Check if campaign is now successful
  const updatedCampaign = await prisma.pledgeCampaign.findUnique({
    where: { id: input.campaignId },
  });

  if (updatedCampaign && updatedCampaign.status === 'active') {
    const isSuccess = isCampaignSuccessful({
      fundingType: updatedCampaign.fundingType,
      pledgedAmount: updatedCampaign.pledgedAmount,
      goalAmount: updatedCampaign.goalAmount,
      minimumAmount: updatedCampaign.minimumAmount,
    });

    if (isSuccess && !updatedCampaign.fundedAt) {
      await prisma.pledgeCampaign.update({
        where: { id: input.campaignId },
        data: { fundedAt: new Date() },
      });
    }
  }

  return pledge;
}

// Get pledge by ID
export async function getPledgeById(id: string) {
  const pledge = await prisma.pledge.findUnique({
    where: { id },
    include: {
      campaign: {
        include: {
          project: true,
          creator: { select: { id: true, name: true } },
        },
      },
      reward: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      fulfillment: true,
    },
  });

  return pledge;
}

// Update pledge
export async function updatePledge(id: string, userId: string, input: UpdatePledgeInput) {
  const existingPledge = await prisma.pledge.findUnique({
    where: { id },
    include: { campaign: true, reward: true },
  });

  if (!existingPledge) {
    throw new Error('Pledge not found');
  }

  if (existingPledge.userId !== userId) {
    throw new Error('Not authorized to update this pledge');
  }

  if (existingPledge.status !== 'active') {
    throw new Error('Can only update active pledges');
  }

  if (existingPledge.campaign.status !== 'active') {
    throw new Error('Campaign is no longer active');
  }

  // Validate new reward if changing
  if (input.rewardId !== undefined && input.rewardId !== existingPledge.rewardId) {
    if (input.rewardId) {
      const reward = await prisma.campaignReward.findFirst({
        where: {
          id: input.rewardId,
          campaignId: existingPledge.campaignId,
          isVisible: true,
        },
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      const newAmount = input.amount !== undefined ? input.amount : existingPledge.amount;
      if (newAmount < reward.amount) {
        throw new Error(`Pledge amount must be at least $${reward.amount} for this reward`);
      }

      if (reward.quantity !== null && reward.claimed >= reward.quantity) {
        throw new Error('This reward is sold out');
      }
    }
  }

  const updatedPledge = await prisma.$transaction(async (tx) => {
    // Calculate amount difference
    const amountDiff = (input.amount !== undefined ? input.amount : existingPledge.amount) - existingPledge.amount;

    // Update pledge
    const pledge = await tx.pledge.update({
      where: { id },
      data: {
        amount: input.amount,
        tipAmount: input.tipAmount,
        rewardId: input.rewardId,
        isAnonymous: input.isAnonymous,
        message: input.message,
      },
      include: {
        campaign: true,
        reward: true,
      },
    });

    // Update campaign pledged amount if changed
    if (amountDiff !== 0) {
      await tx.pledgeCampaign.update({
        where: { id: existingPledge.campaignId },
        data: {
          pledgedAmount: { increment: amountDiff },
        },
      });
    }

    // Update reward claimed counts if reward changed
    if (input.rewardId !== undefined && input.rewardId !== existingPledge.rewardId) {
      // Decrement old reward
      if (existingPledge.rewardId) {
        await tx.campaignReward.update({
          where: { id: existingPledge.rewardId },
          data: { claimed: { decrement: 1 } },
        });
      }
      // Increment new reward
      if (input.rewardId) {
        await tx.campaignReward.update({
          where: { id: input.rewardId },
          data: { claimed: { increment: 1 } },
        });
      }
    }

    return pledge;
  });

  return updatedPledge;
}

// Cancel pledge
export async function cancelPledge(id: string, userId: string) {
  const pledge = await prisma.pledge.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!pledge) {
    throw new Error('Pledge not found');
  }

  if (pledge.userId !== userId) {
    throw new Error('Not authorized to cancel this pledge');
  }

  if (pledge.status !== 'active') {
    throw new Error('Can only cancel active pledges');
  }

  // Can only cancel if campaign is still active
  if (pledge.campaign.status !== 'active') {
    throw new Error('Cannot cancel pledge - campaign is no longer active');
  }

  const cancelledPledge = await prisma.$transaction(async (tx) => {
    const updated = await tx.pledge.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    // Update campaign stats
    await tx.pledgeCampaign.update({
      where: { id: pledge.campaignId },
      data: {
        pledgedAmount: { decrement: pledge.amount },
        backerCount: { decrement: 1 },
      },
    });

    // Update reward claimed count
    if (pledge.rewardId) {
      await tx.campaignReward.update({
        where: { id: pledge.rewardId },
        data: { claimed: { decrement: 1 } },
      });
    }

    return updated;
  });

  return cancelledPledge;
}

// Get pledges for a campaign
export async function getCampaignPledges(
  campaignId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
    includeAnonymous?: boolean;
  }
) {
  const { status = 'active', limit = 50, offset = 0, includeAnonymous = true } = options || {};

  const where: Record<string, unknown> = { campaignId };
  if (status) where.status = status;

  const [pledges, total] = await Promise.all([
    prisma.pledge.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        reward: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.pledge.count({ where }),
  ]);

  // Hide user info for anonymous pledges if needed
  const processedPledges = pledges.map(pledge => {
    if (pledge.isAnonymous && !includeAnonymous) {
      return {
        ...pledge,
        user: { id: 'anonymous', name: 'Anonymous Backer', avatarUrl: null },
      };
    }
    return pledge;
  });

  return { pledges: processedPledges, total };
}

// Get user's pledges
export async function getUserPledges(
  userId: string,
  options?: { status?: string; limit?: number; offset?: number }
) {
  const { status, limit = 20, offset = 0 } = options || {};

  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;

  const [pledges, total] = await Promise.all([
    prisma.pledge.findMany({
      where,
      include: {
        campaign: {
          include: {
            project: { select: { id: true, title: true, category: true } },
            creator: { select: { id: true, name: true } },
          },
        },
        reward: true,
        fulfillment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.pledge.count({ where }),
  ]);

  return { pledges, total };
}

// Get recent backers for display (public backer wall)
export async function getRecentBackers(campaignId: string, limit: number = 10) {
  const pledges = await prisma.pledge.findMany({
    where: {
      campaignId,
      status: 'active',
      isAnonymous: false,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return pledges;
}

// Get top backers
export async function getTopBackers(campaignId: string, limit: number = 10) {
  const pledges = await prisma.pledge.findMany({
    where: {
      campaignId,
      status: 'active',
      isAnonymous: false,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { amount: 'desc' },
    take: limit,
  });

  return pledges;
}

// Check if user has active pledge for campaign
export async function hasActivePledge(campaignId: string, userId: string): Promise<boolean> {
  const pledge = await prisma.pledge.findFirst({
    where: {
      campaignId,
      userId,
      status: 'active',
    },
  });

  return !!pledge;
}

// Get pledge count by reward
export async function getPledgeCountByReward(campaignId: string) {
  const rewards = await prisma.campaignReward.findMany({
    where: { campaignId },
    include: {
      _count: {
        select: {
          pledges: {
            where: { status: 'active' },
          },
        },
      },
    },
  });

  return rewards.map(reward => ({
    rewardId: reward.id,
    title: reward.title,
    amount: reward.amount,
    pledgeCount: reward._count.pledges,
    quantity: reward.quantity,
    claimed: reward.claimed,
    availableQuantity: reward.quantity ? reward.quantity - reward.claimed : null,
  }));
}
