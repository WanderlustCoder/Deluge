import { prisma } from '@/lib/prisma';

// Constants
export const CAMPAIGN_STATUSES = ['draft', 'active', 'successful', 'failed', 'cancelled'] as const;
export const FUNDING_TYPES = ['all_or_nothing', 'flexible', 'milestone'] as const;
export const PLATFORM_FEE_RATE = 0.05; // 5% platform fee on successful campaigns
export const PAYMENT_PROCESSING_RATE = 0.029; // 2.9% + $0.30 per transaction
export const PAYMENT_PROCESSING_FIXED = 0.30;

export type CampaignStatus = typeof CAMPAIGN_STATUSES[number];
export type FundingType = typeof FUNDING_TYPES[number];

export interface StretchGoal {
  amount: number;
  title: string;
  description: string;
  unlocked?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CreateCampaignInput {
  projectId: string;
  creatorId: string;
  title: string;
  slug: string;
  description: string;
  story?: string;
  videoUrl?: string;
  coverImageUrl?: string;
  goalAmount: number;
  minimumAmount?: number;
  fundingType?: FundingType;
  startDate: Date;
  endDate: Date;
  timezone?: string;
  stretchGoals?: StretchGoal[];
  faqs?: FAQ[];
}

export interface UpdateCampaignInput {
  title?: string;
  description?: string;
  story?: string;
  videoUrl?: string;
  coverImageUrl?: string;
  goalAmount?: number;
  minimumAmount?: number;
  startDate?: Date;
  endDate?: Date;
  stretchGoals?: StretchGoal[];
  faqs?: FAQ[];
  status?: CampaignStatus;
}

// Create a new campaign
export async function createCampaign(input: CreateCampaignInput) {
  const campaign = await prisma.pledgeCampaign.create({
    data: {
      projectId: input.projectId,
      creatorId: input.creatorId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      story: input.story,
      videoUrl: input.videoUrl,
      coverImageUrl: input.coverImageUrl,
      goalAmount: input.goalAmount,
      minimumAmount: input.minimumAmount,
      fundingType: input.fundingType || 'all_or_nothing',
      startDate: input.startDate,
      endDate: input.endDate,
      timezone: input.timezone || 'America/Los_Angeles',
      stretchGoals: input.stretchGoals ? JSON.stringify(input.stretchGoals) : null,
      faqs: input.faqs ? JSON.stringify(input.faqs) : null,
      status: 'draft',
    },
    include: {
      project: true,
      creator: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return campaign;
}

// Get campaign by slug
export async function getCampaignBySlug(slug: string, options?: { includeStats?: boolean }) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { slug },
    include: {
      project: true,
      creator: { select: { id: true, name: true, avatarUrl: true } },
      rewards: {
        where: { isVisible: true },
        orderBy: { amount: 'asc' },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          pledges: true,
          comments: true,
        },
      },
    },
  });

  if (!campaign) return null;

  // Parse JSON fields
  return {
    ...campaign,
    stretchGoals: campaign.stretchGoals ? JSON.parse(campaign.stretchGoals) as StretchGoal[] : [],
    faqs: campaign.faqs ? JSON.parse(campaign.faqs) as FAQ[] : [],
  };
}

// Get campaign by ID
export async function getCampaignById(id: string) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id },
    include: {
      project: true,
      creator: { select: { id: true, name: true, avatarUrl: true } },
      rewards: {
        orderBy: { amount: 'asc' },
      },
    },
  });

  if (!campaign) return null;

  return {
    ...campaign,
    stretchGoals: campaign.stretchGoals ? JSON.parse(campaign.stretchGoals) as StretchGoal[] : [],
    faqs: campaign.faqs ? JSON.parse(campaign.faqs) as FAQ[] : [],
  };
}

// Update campaign
export async function updateCampaign(id: string, input: UpdateCampaignInput) {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.story !== undefined) updateData.story = input.story;
  if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
  if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl;
  if (input.goalAmount !== undefined) updateData.goalAmount = input.goalAmount;
  if (input.minimumAmount !== undefined) updateData.minimumAmount = input.minimumAmount;
  if (input.startDate !== undefined) updateData.startDate = input.startDate;
  if (input.endDate !== undefined) updateData.endDate = input.endDate;
  if (input.stretchGoals !== undefined) updateData.stretchGoals = JSON.stringify(input.stretchGoals);
  if (input.faqs !== undefined) updateData.faqs = JSON.stringify(input.faqs);
  if (input.status !== undefined) updateData.status = input.status;

  const campaign = await prisma.pledgeCampaign.update({
    where: { id },
    data: updateData,
    include: {
      project: true,
      creator: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return campaign;
}

// Launch campaign (change from draft to active)
export async function launchCampaign(id: string) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id },
    include: { rewards: true },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status !== 'draft') {
    throw new Error('Only draft campaigns can be launched');
  }

  // Validate campaign is ready
  if (!campaign.title || !campaign.description || !campaign.goalAmount) {
    throw new Error('Campaign must have title, description, and goal amount');
  }

  if (campaign.endDate <= new Date()) {
    throw new Error('Campaign end date must be in the future');
  }

  const updatedCampaign = await prisma.pledgeCampaign.update({
    where: { id },
    data: {
      status: 'active',
      startDate: new Date(), // Start now if not already set
    },
  });

  return updatedCampaign;
}

// Cancel campaign
export async function cancelCampaign(id: string, reason?: string) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.status === 'successful' || campaign.status === 'failed') {
    throw new Error('Cannot cancel a completed campaign');
  }

  // Cancel all active pledges
  await prisma.pledge.updateMany({
    where: {
      campaignId: id,
      status: 'active',
    },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  });

  const updatedCampaign = await prisma.pledgeCampaign.update({
    where: { id },
    data: {
      status: 'cancelled',
    },
  });

  return updatedCampaign;
}

// List campaigns with filters
export async function listCampaigns(options: {
  status?: CampaignStatus;
  fundingType?: FundingType;
  category?: string;
  search?: string;
  creatorId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'ending_soon' | 'most_funded' | 'trending';
}) {
  const {
    status = 'active',
    fundingType,
    category,
    search,
    creatorId,
    limit = 20,
    offset = 0,
    sortBy = 'newest',
  } = options;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (fundingType) where.fundingType = fundingType;
  if (creatorId) where.creatorId = creatorId;
  if (category) where.project = { category };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  let orderBy: Record<string, string>;
  switch (sortBy) {
    case 'ending_soon':
      orderBy = { endDate: 'asc' };
      break;
    case 'most_funded':
      orderBy = { pledgedAmount: 'desc' };
      break;
    case 'trending':
      orderBy = { backerCount: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [campaigns, total] = await Promise.all([
    prisma.pledgeCampaign.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        project: { select: { id: true, title: true, category: true } },
        creator: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { pledges: true } },
      },
    }),
    prisma.pledgeCampaign.count({ where }),
  ]);

  return { campaigns, total };
}

// Get campaigns by user (backed)
export async function getUserBackedCampaigns(userId: string) {
  const pledges = await prisma.pledge.findMany({
    where: { userId },
    include: {
      campaign: {
        include: {
          project: { select: { id: true, title: true, category: true } },
          creator: { select: { id: true, name: true } },
        },
      },
      reward: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return pledges;
}

// Get campaigns created by user
export async function getUserCreatedCampaigns(userId: string) {
  const campaigns = await prisma.pledgeCampaign.findMany({
    where: { creatorId: userId },
    include: {
      project: { select: { id: true, title: true } },
      _count: { select: { pledges: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return campaigns;
}

// Calculate campaign progress percentage
export function calculateProgress(pledgedAmount: number, goalAmount: number): number {
  if (goalAmount <= 0) return 0;
  return Math.min(100, Math.round((pledgedAmount / goalAmount) * 100));
}

// Check if campaign is successful based on funding type
export function isCampaignSuccessful(
  campaign: { fundingType: string; pledgedAmount: number; goalAmount: number; minimumAmount: number | null }
): boolean {
  const { fundingType, pledgedAmount, goalAmount, minimumAmount } = campaign;

  switch (fundingType) {
    case 'all_or_nothing':
      return pledgedAmount >= goalAmount;
    case 'flexible':
      return pledgedAmount >= (minimumAmount || 1);
    case 'milestone':
      // Check if at least 25% milestone is reached
      return pledgedAmount >= goalAmount * 0.25;
    default:
      return false;
  }
}

// Get unlocked stretch goals
export function getUnlockedStretchGoals(stretchGoals: StretchGoal[], pledgedAmount: number): StretchGoal[] {
  return stretchGoals
    .filter(goal => pledgedAmount >= goal.amount)
    .map(goal => ({ ...goal, unlocked: true }));
}

// Get next stretch goal
export function getNextStretchGoal(stretchGoals: StretchGoal[], pledgedAmount: number): StretchGoal | null {
  const sorted = [...stretchGoals].sort((a, b) => a.amount - b.amount);
  return sorted.find(goal => pledgedAmount < goal.amount) || null;
}

// Increment view count
export async function incrementViewCount(id: string) {
  await prisma.pledgeCampaign.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

// Increment share count
export async function incrementShareCount(id: string) {
  await prisma.pledgeCampaign.update({
    where: { id },
    data: { shareCount: { increment: 1 } },
  });
}

// Generate unique slug
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.pledgeCampaign.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
