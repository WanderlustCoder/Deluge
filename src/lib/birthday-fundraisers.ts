import { prisma } from './prisma';
import { nanoid } from 'nanoid';

// Create a birthday fundraiser
export async function createBirthdayFundraiser(
  userId: string,
  data: {
    title: string;
    description: string;
    birthdayDate: Date;
    goalAmount: number;
    projectId?: string;
    communityId?: string;
  }
) {
  // Generate unique share URL
  const shareUrl = nanoid(10);

  return prisma.birthdayFundraiser.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      birthdayDate: data.birthdayDate,
      goalAmount: data.goalAmount,
      projectId: data.projectId,
      communityId: data.communityId,
      shareUrl,
      status: 'active',
    },
    include: {
      project: {
        select: { id: true, title: true },
      },
    },
  });
}

// Get fundraiser by ID
export async function getFundraiser(id: string) {
  return prisma.birthdayFundraiser.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
      project: {
        select: { id: true, title: true, description: true, imageUrl: true },
      },
    },
  });
}

// Get fundraiser by share URL
export async function getFundraiserByShareUrl(shareUrl: string) {
  return prisma.birthdayFundraiser.findUnique({
    where: { shareUrl },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
      project: {
        select: { id: true, title: true, description: true, imageUrl: true },
      },
    },
  });
}

// Get user's fundraisers
export async function getUserFundraisers(userId: string) {
  return prisma.birthdayFundraiser.findMany({
    where: { userId },
    orderBy: { birthdayDate: 'desc' },
    include: {
      project: {
        select: { id: true, title: true },
      },
    },
  });
}

// Get active fundraiser for user
export async function getActiveFundraiser(userId: string) {
  return prisma.birthdayFundraiser.findFirst({
    where: { userId, status: 'active' },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
      project: {
        select: { id: true, title: true },
      },
    },
  });
}

// Contribute to a birthday fundraiser
export async function contributeToFundraiser(
  fundraiserId: string,
  contributorId: string,
  amount: number
) {
  const fundraiser = await prisma.birthdayFundraiser.findUnique({
    where: { id: fundraiserId },
    include: { user: true },
  });

  if (!fundraiser || fundraiser.status !== 'active') {
    throw new Error('Fundraiser not found or inactive');
  }

  // Get contributor's watershed
  const watershed = await prisma.watershed.findUnique({
    where: { userId: contributorId },
  });

  if (!watershed || watershed.balance < amount) {
    throw new Error('Insufficient watershed balance');
  }

  // Update fundraiser amount
  await prisma.birthdayFundraiser.update({
    where: { id: fundraiserId },
    data: {
      currentAmount: { increment: amount },
      backerCount: { increment: 1 },
    },
  });

  // Deduct from watershed
  await prisma.$transaction([
    prisma.watershed.update({
      where: { userId: contributorId },
      data: { balance: { decrement: amount } },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        type: 'birthday_contribution',
        amount: -amount,
        description: `Contribution to ${fundraiser.title}`,
        balanceAfter: watershed.balance - amount,
      },
    }),
  ]);

  // If there's a project, fund it
  if (fundraiser.projectId) {
    await prisma.$transaction([
      prisma.project.update({
        where: { id: fundraiser.projectId },
        data: {
          fundingRaised: { increment: amount },
          backerCount: { increment: 1 },
        },
      }),
      prisma.allocation.create({
        data: {
          userId: contributorId,
          projectId: fundraiser.projectId,
          amount,
        },
      }),
    ]);
  }

  return prisma.birthdayFundraiser.findUnique({
    where: { id: fundraiserId },
  });
}

// Update fundraiser
export async function updateFundraiser(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string;
    goalAmount: number;
    projectId: string;
    communityId: string;
    status: 'active' | 'completed' | 'cancelled';
  }>
) {
  // Verify ownership
  const fundraiser = await prisma.birthdayFundraiser.findUnique({
    where: { id },
  });

  if (!fundraiser || fundraiser.userId !== userId) {
    throw new Error('Fundraiser not found or unauthorized');
  }

  return prisma.birthdayFundraiser.update({
    where: { id },
    data,
  });
}

// Cancel fundraiser
export async function cancelFundraiser(id: string, userId: string) {
  return updateFundraiser(id, userId, { status: 'cancelled' });
}

// Complete fundraiser
export async function completeFundraiser(id: string, userId: string) {
  return updateFundraiser(id, userId, { status: 'completed' });
}

// Get upcoming birthdays (for notifications)
export async function getUpcomingBirthdays(days = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.birthdayFundraiser.findMany({
    where: {
      status: 'active',
      birthdayDate: { gte: now, lte: future },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { birthdayDate: 'asc' },
  });
}

// Calculate fundraiser progress
export function calculateProgress(currentAmount: number, goalAmount: number): number {
  if (!goalAmount || goalAmount === 0) return 0;
  return Math.min(100, (currentAmount / goalAmount) * 100);
}
