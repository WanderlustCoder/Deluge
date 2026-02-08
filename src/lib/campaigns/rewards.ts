import { prisma } from '@/lib/prisma';

export type DeliveryType = 'digital' | 'physical' | 'experience';

export interface RewardItem {
  name: string;
  quantity: number;
}

export interface CreateRewardInput {
  campaignId: string;
  title: string;
  description: string;
  amount: number;
  quantity?: number;
  estimatedDelivery?: Date;
  deliveryType?: DeliveryType;
  shippingRequired?: boolean;
  shippingCost?: number;
  imageUrl?: string;
  items?: RewardItem[];
  order?: number;
}

export interface UpdateRewardInput {
  title?: string;
  description?: string;
  amount?: number;
  quantity?: number;
  estimatedDelivery?: Date;
  deliveryType?: DeliveryType;
  shippingRequired?: boolean;
  shippingCost?: number;
  imageUrl?: string;
  items?: RewardItem[];
  order?: number;
  isVisible?: boolean;
}

// Create a new reward tier
export async function createReward(input: CreateRewardInput) {
  // Verify campaign exists and is in draft or active status
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id: input.campaignId },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'draft' && campaign.status !== 'active') {
    throw new Error('Cannot add rewards to a completed campaign');
  }

  // Get the next order number if not provided
  let order = input.order;
  if (order === undefined) {
    const lastReward = await prisma.campaignReward.findFirst({
      where: { campaignId: input.campaignId },
      orderBy: { order: 'desc' },
    });
    order = (lastReward?.order || 0) + 1;
  }

  const reward = await prisma.campaignReward.create({
    data: {
      campaignId: input.campaignId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      quantity: input.quantity,
      estimatedDelivery: input.estimatedDelivery,
      deliveryType: input.deliveryType || 'digital',
      shippingRequired: input.shippingRequired || false,
      shippingCost: input.shippingCost,
      imageUrl: input.imageUrl,
      items: input.items ? JSON.stringify(input.items) : null,
      order,
    },
  });

  return {
    ...reward,
    items: reward.items ? JSON.parse(reward.items) as RewardItem[] : [],
  };
}

// Get reward by ID
export async function getRewardById(id: string) {
  const reward = await prisma.campaignReward.findUnique({
    where: { id },
    include: {
      campaign: {
        select: { id: true, title: true, status: true, creatorId: true },
      },
      _count: {
        select: { pledges: { where: { status: 'active' } } },
      },
    },
  });

  if (!reward) return null;

  return {
    ...reward,
    items: reward.items ? JSON.parse(reward.items) as RewardItem[] : [],
    activePledgeCount: reward._count.pledges,
  };
}

// Update reward
export async function updateReward(id: string, input: UpdateRewardInput) {
  const existingReward = await prisma.campaignReward.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!existingReward) {
    throw new Error('Reward not found');
  }

  // Don't allow changing amount if there are active pledges
  if (input.amount !== undefined && input.amount !== existingReward.amount) {
    const activePledges = await prisma.pledge.count({
      where: { rewardId: id, status: 'active' },
    });

    if (activePledges > 0) {
      throw new Error('Cannot change reward amount while there are active pledges');
    }
  }

  // Don't allow reducing quantity below claimed count
  if (input.quantity !== undefined && input.quantity !== null) {
    if (input.quantity < existingReward.claimed) {
      throw new Error(`Cannot reduce quantity below ${existingReward.claimed} (already claimed)`);
    }
  }

  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.quantity !== undefined) updateData.quantity = input.quantity;
  if (input.estimatedDelivery !== undefined) updateData.estimatedDelivery = input.estimatedDelivery;
  if (input.deliveryType !== undefined) updateData.deliveryType = input.deliveryType;
  if (input.shippingRequired !== undefined) updateData.shippingRequired = input.shippingRequired;
  if (input.shippingCost !== undefined) updateData.shippingCost = input.shippingCost;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.items !== undefined) updateData.items = JSON.stringify(input.items);
  if (input.order !== undefined) updateData.order = input.order;
  if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;

  const reward = await prisma.campaignReward.update({
    where: { id },
    data: updateData,
  });

  return {
    ...reward,
    items: reward.items ? JSON.parse(reward.items) as RewardItem[] : [],
  };
}

// Delete reward (only if no pledges)
export async function deleteReward(id: string) {
  const reward = await prisma.campaignReward.findUnique({
    where: { id },
    include: {
      _count: { select: { pledges: true } },
    },
  });

  if (!reward) {
    throw new Error('Reward not found');
  }

  if (reward._count.pledges > 0) {
    throw new Error('Cannot delete reward with existing pledges. Hide it instead.');
  }

  await prisma.campaignReward.delete({
    where: { id },
  });

  return true;
}

// Get rewards for a campaign
export async function getCampaignRewards(campaignId: string, options?: { includeHidden?: boolean }) {
  const { includeHidden = false } = options || {};

  const where: Record<string, unknown> = { campaignId };
  if (!includeHidden) {
    where.isVisible = true;
  }

  const rewards = await prisma.campaignReward.findMany({
    where,
    include: {
      _count: {
        select: { pledges: { where: { status: 'active' } } },
      },
    },
    orderBy: { amount: 'asc' },
  });

  return rewards.map(reward => ({
    ...reward,
    items: reward.items ? JSON.parse(reward.items) as RewardItem[] : [],
    activePledgeCount: reward._count.pledges,
    availableQuantity: reward.quantity ? reward.quantity - reward.claimed : null,
    isSoldOut: reward.quantity !== null && reward.claimed >= reward.quantity,
  }));
}

// Reorder rewards
export async function reorderRewards(campaignId: string, rewardIds: string[]) {
  // Verify all rewards belong to the campaign
  const rewards = await prisma.campaignReward.findMany({
    where: { campaignId },
    select: { id: true },
  });

  const existingIds = new Set(rewards.map(r => r.id));
  const validIds = rewardIds.filter(id => existingIds.has(id));

  // Update order for each reward
  await prisma.$transaction(
    validIds.map((id, index) =>
      prisma.campaignReward.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  return true;
}

// Get reward statistics for a campaign
export async function getRewardStats(campaignId: string) {
  const rewards = await prisma.campaignReward.findMany({
    where: { campaignId },
    include: {
      _count: {
        select: {
          pledges: { where: { status: 'active' } },
        },
      },
      pledges: {
        where: { status: 'active' },
        select: { amount: true },
      },
    },
    orderBy: { amount: 'asc' },
  });

  const stats = rewards.map(reward => {
    const totalPledged = reward.pledges.reduce((sum, p) => sum + p.amount, 0);

    return {
      id: reward.id,
      title: reward.title,
      amount: reward.amount,
      quantity: reward.quantity,
      claimed: reward.claimed,
      pledgeCount: reward._count.pledges,
      totalPledged,
      isSoldOut: reward.quantity !== null && reward.claimed >= reward.quantity,
    };
  });

  const totalRewards = stats.length;
  const totalClaimed = stats.reduce((sum, s) => sum + s.claimed, 0);
  const soldOutCount = stats.filter(s => s.isSoldOut).length;

  return {
    rewards: stats,
    summary: {
      totalRewards,
      totalClaimed,
      soldOutCount,
    },
  };
}

// Check reward availability
export async function checkRewardAvailability(rewardId: string): Promise<{
  available: boolean;
  remainingQuantity: number | null;
  message?: string;
}> {
  const reward = await prisma.campaignReward.findUnique({
    where: { id: rewardId },
    include: { campaign: true },
  });

  if (!reward) {
    return { available: false, remainingQuantity: null, message: 'Reward not found' };
  }

  if (!reward.isVisible) {
    return { available: false, remainingQuantity: null, message: 'Reward is no longer available' };
  }

  if (reward.campaign.status !== 'active') {
    return { available: false, remainingQuantity: null, message: 'Campaign is not active' };
  }

  if (reward.quantity === null) {
    return { available: true, remainingQuantity: null };
  }

  const remaining = reward.quantity - reward.claimed;
  if (remaining <= 0) {
    return { available: false, remainingQuantity: 0, message: 'This reward is sold out' };
  }

  return { available: true, remainingQuantity: remaining };
}
