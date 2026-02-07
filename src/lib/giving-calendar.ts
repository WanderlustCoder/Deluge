import { prisma } from './prisma';

export type ScheduledGiftStatus = 'scheduled' | 'completed' | 'skipped' | 'failed';

// Create a scheduled gift
export async function createScheduledGift(
  userId: string,
  data: {
    occasionId?: string;
    customOccasion?: string;
    scheduledDate: Date;
    amount: number;
    projectId?: string;
    communityId?: string;
    recipientName?: string;
    recipientEmail?: string;
    message?: string;
  }
) {
  return prisma.scheduledGift.create({
    data: {
      userId,
      occasionId: data.occasionId,
      customOccasion: data.customOccasion,
      scheduledDate: data.scheduledDate,
      amount: data.amount,
      projectId: data.projectId,
      communityId: data.communityId,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      message: data.message,
      status: 'scheduled',
    },
  });
}

// Get user's scheduled gifts
export async function getUserScheduledGifts(
  userId: string,
  options?: { status?: ScheduledGiftStatus; limit?: number }
) {
  const where: Record<string, unknown> = { userId };

  if (options?.status) {
    where.status = options.status;
  }

  return prisma.scheduledGift.findMany({
    where,
    include: {
      occasion: {
        select: { id: true, name: true, iconName: true, color: true },
      },
    },
    orderBy: { scheduledDate: 'asc' },
    take: options?.limit || 50,
  });
}

// Get user's upcoming scheduled gifts
export async function getUpcomingScheduledGifts(userId: string, days = 30) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.scheduledGift.findMany({
    where: {
      userId,
      status: 'scheduled',
      scheduledDate: { gte: now, lte: future },
    },
    include: {
      occasion: {
        select: { id: true, name: true, iconName: true, color: true },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });
}

// Get scheduled gift by ID
export async function getScheduledGift(id: string, userId: string) {
  return prisma.scheduledGift.findFirst({
    where: { id, userId },
    include: {
      occasion: true,
    },
  });
}

// Update scheduled gift
export async function updateScheduledGift(
  id: string,
  userId: string,
  data: Partial<{
    scheduledDate: Date;
    amount: number;
    projectId: string;
    communityId: string;
    recipientName: string;
    recipientEmail: string;
    message: string;
    status: ScheduledGiftStatus;
  }>
) {
  // Verify ownership
  const gift = await prisma.scheduledGift.findFirst({
    where: { id, userId },
  });

  if (!gift) {
    throw new Error('Scheduled gift not found');
  }

  return prisma.scheduledGift.update({
    where: { id },
    data,
  });
}

// Skip a scheduled gift
export async function skipScheduledGift(id: string, userId: string) {
  return updateScheduledGift(id, userId, { status: 'skipped' });
}

// Cancel a scheduled gift
export async function cancelScheduledGift(id: string, userId: string) {
  const gift = await prisma.scheduledGift.findFirst({
    where: { id, userId },
  });

  if (!gift) {
    throw new Error('Scheduled gift not found');
  }

  return prisma.scheduledGift.delete({
    where: { id },
  });
}

// Process due scheduled gifts (for cron job)
export async function processDueScheduledGifts() {
  const now = new Date();

  const dueGifts = await prisma.scheduledGift.findMany({
    where: {
      status: 'scheduled',
      scheduledDate: { lte: now },
    },
    include: {
      user: {
        include: { watershed: true },
      },
    },
  });

  const results: { id: string; status: 'completed' | 'failed'; error?: string }[] = [];

  for (const gift of dueGifts) {
    try {
      const watershed = gift.user.watershed;

      if (!watershed || watershed.balance < gift.amount) {
        await prisma.scheduledGift.update({
          where: { id: gift.id },
          data: { status: 'failed' },
        });
        results.push({ id: gift.id, status: 'failed', error: 'Insufficient balance' });
        continue;
      }

      // Process the gift
      await prisma.$transaction([
        prisma.watershed.update({
          where: { userId: gift.userId },
          data: { balance: { decrement: gift.amount } },
        }),
        prisma.watershedTransaction.create({
          data: {
            watershedId: watershed.id,
            type: 'scheduled_gift',
            amount: -gift.amount,
            description: gift.customOccasion || 'Scheduled giving',
            balanceAfter: watershed.balance - gift.amount,
          },
        }),
        prisma.scheduledGift.update({
          where: { id: gift.id },
          data: { status: 'completed', completedAt: new Date() },
        }),
      ]);

      // If there's a project, fund it
      if (gift.projectId) {
        await prisma.$transaction([
          prisma.project.update({
            where: { id: gift.projectId },
            data: {
              fundingRaised: { increment: gift.amount },
              backerCount: { increment: 1 },
            },
          }),
          prisma.allocation.create({
            data: {
              userId: gift.userId,
              projectId: gift.projectId,
              amount: gift.amount,
            },
          }),
        ]);
      }

      // If there's a recipient, create a gift contribution record
      if (gift.recipientName) {
        await prisma.giftContribution.create({
          data: {
            contributorId: gift.userId,
            recipientName: gift.recipientName,
            recipientEmail: gift.recipientEmail || undefined,
            occasionType: 'holiday',
            message: gift.message || undefined,
            amount: gift.amount,
            projectId: gift.projectId,
            communityId: gift.communityId,
            notificationDate: new Date(),
          },
        });
      }

      results.push({ id: gift.id, status: 'completed' });
    } catch (error) {
      await prisma.scheduledGift.update({
        where: { id: gift.id },
        data: { status: 'failed' },
      });
      results.push({
        id: gift.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

// Get calendar view data for a month
export async function getCalendarMonth(userId: string, year: number, month: number) {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const scheduledGifts = await prisma.scheduledGift.findMany({
    where: {
      userId,
      scheduledDate: { gte: startOfMonth, lte: endOfMonth },
    },
    include: {
      occasion: {
        select: { name: true, iconName: true, color: true },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  // Group by day
  const byDay: Record<number, typeof scheduledGifts> = {};
  for (const gift of scheduledGifts) {
    const day = gift.scheduledDate.getDate();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(gift);
  }

  return byDay;
}

// Get total scheduled for a period
export async function getScheduledTotal(userId: string, startDate: Date, endDate: Date) {
  const gifts = await prisma.scheduledGift.findMany({
    where: {
      userId,
      status: 'scheduled',
      scheduledDate: { gte: startDate, lte: endDate },
    },
    select: { amount: true },
  });

  return gifts.reduce((sum, g) => sum + g.amount, 0);
}
