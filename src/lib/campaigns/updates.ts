import { prisma } from '@/lib/prisma';

export interface CreateUpdateInput {
  campaignId: string;
  authorId: string;
  title: string;
  content: string;
  isBackersOnly?: boolean;
  attachments?: string[];
}

export interface UpdateInput {
  title?: string;
  content?: string;
  isBackersOnly?: boolean;
  attachments?: string[];
}

// Create a campaign update
export async function createCampaignUpdate(input: CreateUpdateInput) {
  // Verify campaign exists and user is the creator
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id: input.campaignId },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.creatorId !== input.authorId) {
    throw new Error('Only the campaign creator can post updates');
  }

  const update = await prisma.$transaction(async (tx) => {
    const newUpdate = await tx.campaignUpdate.create({
      data: {
        campaignId: input.campaignId,
        authorId: input.authorId,
        title: input.title,
        content: input.content,
        isBackersOnly: input.isBackersOnly || false,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
      },
    });

    // Increment update count on campaign
    await tx.pledgeCampaign.update({
      where: { id: input.campaignId },
      data: { updateCount: { increment: 1 } },
    });

    return newUpdate;
  });

  return {
    ...update,
    attachments: update.attachments ? JSON.parse(update.attachments) as string[] : [],
  };
}

// Get update by ID
export async function getUpdateById(id: string, userId?: string) {
  const update = await prisma.campaignUpdate.findUnique({
    where: { id },
    include: {
      campaign: {
        select: { id: true, title: true, creatorId: true },
      },
    },
  });

  if (!update) return null;

  // Check if user can view backers-only content
  if (update.isBackersOnly && userId) {
    const isBacker = await prisma.pledge.findFirst({
      where: {
        campaignId: update.campaignId,
        userId,
        status: 'active',
      },
    });

    const isCreator = update.campaign.creatorId === userId;

    if (!isBacker && !isCreator) {
      return {
        ...update,
        content: '[This update is only visible to backers]',
        attachments: [],
        isRestricted: true,
      };
    }
  }

  return {
    ...update,
    attachments: update.attachments ? JSON.parse(update.attachments) as string[] : [],
    isRestricted: false,
  };
}

// Update a campaign update
export async function updateCampaignUpdate(id: string, authorId: string, input: UpdateInput) {
  const existingUpdate = await prisma.campaignUpdate.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!existingUpdate) {
    throw new Error('Update not found');
  }

  if (existingUpdate.campaign.creatorId !== authorId) {
    throw new Error('Only the campaign creator can edit updates');
  }

  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.isBackersOnly !== undefined) updateData.isBackersOnly = input.isBackersOnly;
  if (input.attachments !== undefined) updateData.attachments = JSON.stringify(input.attachments);

  const update = await prisma.campaignUpdate.update({
    where: { id },
    data: updateData,
  });

  return {
    ...update,
    attachments: update.attachments ? JSON.parse(update.attachments) as string[] : [],
  };
}

// Delete a campaign update
export async function deleteCampaignUpdate(id: string, authorId: string) {
  const existingUpdate = await prisma.campaignUpdate.findUnique({
    where: { id },
    include: { campaign: true },
  });

  if (!existingUpdate) {
    throw new Error('Update not found');
  }

  if (existingUpdate.campaign.creatorId !== authorId) {
    throw new Error('Only the campaign creator can delete updates');
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaignUpdate.delete({
      where: { id },
    });

    // Decrement update count on campaign
    await tx.pledgeCampaign.update({
      where: { id: existingUpdate.campaignId },
      data: { updateCount: { decrement: 1 } },
    });
  });

  return true;
}

// Get updates for a campaign
export async function getCampaignUpdates(
  campaignId: string,
  options?: {
    userId?: string;
    limit?: number;
    offset?: number;
  }
) {
  const { userId, limit = 20, offset = 0 } = options || {};

  // Check if user is a backer or creator
  let canViewBackersOnly = false;
  if (userId) {
    const campaign = await prisma.pledgeCampaign.findUnique({
      where: { id: campaignId },
      select: { creatorId: true },
    });

    if (campaign?.creatorId === userId) {
      canViewBackersOnly = true;
    } else {
      const pledge = await prisma.pledge.findFirst({
        where: {
          campaignId,
          userId,
          status: 'active',
        },
      });
      canViewBackersOnly = !!pledge;
    }
  }

  const [updates, total] = await Promise.all([
    prisma.campaignUpdate.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.campaignUpdate.count({ where: { campaignId } }),
  ]);

  // Filter content for backers-only updates if user is not a backer
  const processedUpdates = updates.map(update => {
    if (update.isBackersOnly && !canViewBackersOnly) {
      return {
        ...update,
        content: '[This update is only visible to backers]',
        attachments: null,
        isRestricted: true,
      };
    }
    return {
      ...update,
      attachments: update.attachments ? JSON.parse(update.attachments) as string[] : [],
      isRestricted: false,
    };
  });

  return { updates: processedUpdates, total, canViewBackersOnly };
}

// Get latest update for a campaign
export async function getLatestUpdate(campaignId: string) {
  const update = await prisma.campaignUpdate.findFirst({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
  });

  if (!update) return null;

  return {
    ...update,
    attachments: update.attachments ? JSON.parse(update.attachments) as string[] : [],
  };
}

// Get all updates by a creator across all their campaigns
export async function getCreatorUpdates(creatorId: string, limit: number = 20) {
  const updates = await prisma.campaignUpdate.findMany({
    where: {
      campaign: { creatorId },
    },
    include: {
      campaign: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return updates.map(update => ({
    ...update,
    attachments: update.attachments ? JSON.parse(update.attachments) as string[] : [],
  }));
}
