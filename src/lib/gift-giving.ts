import { prisma } from './prisma';

export type GiftOccasionType = 'birthday' | 'memorial' | 'celebration' | 'thank_you' | 'holiday';

// Create a gift contribution
export async function createGiftContribution(
  contributorId: string,
  data: {
    recipientName: string;
    recipientEmail?: string;
    occasionType: GiftOccasionType;
    message?: string;
    amount: number;
    projectId?: string;
    communityId?: string;
    isAnonymous?: boolean;
    notificationDate?: Date;
  }
) {
  // Get contributor's watershed
  const watershed = await prisma.watershed.findUnique({
    where: { userId: contributorId },
  });

  if (!watershed || watershed.balance < data.amount) {
    throw new Error('Insufficient watershed balance');
  }

  // Create the gift contribution
  const gift = await prisma.giftContribution.create({
    data: {
      contributorId,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      occasionType: data.occasionType,
      message: data.message,
      amount: data.amount,
      projectId: data.projectId,
      communityId: data.communityId,
      isAnonymous: data.isAnonymous ?? false,
      notificationDate: data.notificationDate,
    },
  });

  // Deduct from watershed
  await prisma.$transaction([
    prisma.watershed.update({
      where: { userId: contributorId },
      data: { balance: { decrement: data.amount } },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        type: 'gift_contribution',
        amount: -data.amount,
        description: `Gift for ${data.recipientName} (${data.occasionType})`,
        balanceAfter: watershed.balance - data.amount,
      },
    }),
  ]);

  // If there's a project, fund it
  if (data.projectId) {
    await prisma.$transaction([
      prisma.project.update({
        where: { id: data.projectId },
        data: {
          fundingRaised: { increment: data.amount },
          backerCount: { increment: 1 },
        },
      }),
      prisma.allocation.create({
        data: {
          userId: contributorId,
          projectId: data.projectId,
          amount: data.amount,
        },
      }),
    ]);
  }

  return gift;
}

// Get gift by ID
export async function getGift(id: string) {
  return prisma.giftContribution.findUnique({
    where: { id },
    include: {
      contributor: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

// Get user's gift history
export async function getUserGifts(userId: string, options?: { limit?: number; offset?: number }) {
  return prisma.giftContribution.findMany({
    where: { contributorId: userId },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// Get pending gift notifications
export async function getPendingGiftNotifications() {
  const now = new Date();

  return prisma.giftContribution.findMany({
    where: {
      notificationSent: false,
      notificationDate: { lte: now },
      recipientEmail: { not: null },
    },
    include: {
      contributor: {
        select: { name: true },
      },
    },
  });
}

// Mark gift notification as sent
export async function markGiftNotificationSent(id: string) {
  return prisma.giftContribution.update({
    where: { id },
    data: { notificationSent: true },
  });
}

// Update gift certificate URL
export async function updateGiftCertificate(id: string, certificateUrl: string) {
  return prisma.giftContribution.update({
    where: { id },
    data: { certificateUrl },
  });
}

// Get gift stats for a user
export async function getUserGiftStats(userId: string) {
  const gifts = await prisma.giftContribution.findMany({
    where: { contributorId: userId },
    select: { amount: true, occasionType: true },
  });

  const totalGiven = gifts.reduce((sum, g) => sum + g.amount, 0);
  const giftCount = gifts.length;

  const byOccasion: Record<string, number> = {};
  for (const gift of gifts) {
    byOccasion[gift.occasionType] = (byOccasion[gift.occasionType] || 0) + gift.amount;
  }

  return {
    totalGiven,
    giftCount,
    byOccasion,
  };
}

// Format occasion type for display
export function formatOccasionType(type: GiftOccasionType): string {
  const labels: Record<GiftOccasionType, string> = {
    birthday: 'Birthday',
    memorial: 'In Memory',
    celebration: 'Celebration',
    thank_you: 'Thank You',
    holiday: 'Holiday',
  };
  return labels[type] || type;
}
