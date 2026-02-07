import { prisma } from './prisma';

// Frequency to days mapping
const FREQUENCY_DAYS: Record<string, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

// Calculate next charge date based on frequency
export function calculateNextChargeDate(frequency: string, fromDate?: Date): Date {
  const baseDate = fromDate || new Date();
  const days = FREQUENCY_DAYS[frequency] || 30;
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

// Create a new recurring contribution
export async function createRecurringContribution(
  userId: string,
  amount: number,
  frequency: string = 'monthly',
  paymentMethodId?: string
) {
  // Check if user already has an active recurring contribution
  const existing = await prisma.recurringContribution.findFirst({
    where: {
      userId,
      status: 'active',
    },
  });

  if (existing) {
    throw new Error('You already have an active recurring contribution. Please modify or cancel it first.');
  }

  const nextChargeDate = calculateNextChargeDate(frequency);

  return prisma.recurringContribution.create({
    data: {
      userId,
      amount,
      frequency,
      nextChargeDate,
      paymentMethodId,
      status: 'active',
    },
  });
}

// Get user's recurring contribution
export async function getUserRecurringContribution(userId: string) {
  return prisma.recurringContribution.findFirst({
    where: {
      userId,
      status: { in: ['active', 'paused'] },
    },
    include: {
      history: {
        orderBy: { chargeDate: 'desc' },
        take: 10,
      },
    },
  });
}

// Update recurring contribution
export async function updateRecurringContribution(
  id: string,
  userId: string,
  updates: {
    amount?: number;
    frequency?: string;
    paymentMethodId?: string;
  }
) {
  // Verify ownership
  const contribution = await prisma.recurringContribution.findFirst({
    where: { id, userId },
  });

  if (!contribution) {
    throw new Error('Recurring contribution not found');
  }

  // If frequency changed, recalculate next charge date
  let nextChargeDate = contribution.nextChargeDate;
  if (updates.frequency && updates.frequency !== contribution.frequency) {
    nextChargeDate = calculateNextChargeDate(
      updates.frequency,
      contribution.lastChargeDate || new Date()
    );
  }

  return prisma.recurringContribution.update({
    where: { id },
    data: {
      ...updates,
      nextChargeDate,
    },
  });
}

// Pause recurring contribution
export async function pauseRecurringContribution(
  id: string,
  userId: string,
  pauseUntil?: Date
) {
  const contribution = await prisma.recurringContribution.findFirst({
    where: { id, userId, status: 'active' },
  });

  if (!contribution) {
    throw new Error('Active recurring contribution not found');
  }

  return prisma.recurringContribution.update({
    where: { id },
    data: {
      status: 'paused',
      pausedUntil: pauseUntil || null,
    },
  });
}

// Resume recurring contribution
export async function resumeRecurringContribution(id: string, userId: string) {
  const contribution = await prisma.recurringContribution.findFirst({
    where: { id, userId, status: 'paused' },
  });

  if (!contribution) {
    throw new Error('Paused recurring contribution not found');
  }

  // Calculate new next charge date from today
  const nextChargeDate = calculateNextChargeDate(contribution.frequency);

  return prisma.recurringContribution.update({
    where: { id },
    data: {
      status: 'active',
      pausedUntil: null,
      nextChargeDate,
    },
  });
}

// Cancel recurring contribution
export async function cancelRecurringContribution(id: string, userId: string) {
  const contribution = await prisma.recurringContribution.findFirst({
    where: { id, userId },
  });

  if (!contribution) {
    throw new Error('Recurring contribution not found');
  }

  return prisma.recurringContribution.update({
    where: { id },
    data: { status: 'cancelled' },
  });
}

// Skip next charge (one-time skip)
export async function skipNextCharge(id: string, userId: string) {
  const contribution = await prisma.recurringContribution.findFirst({
    where: { id, userId, status: 'active' },
  });

  if (!contribution) {
    throw new Error('Active recurring contribution not found');
  }

  // Move next charge date forward by one period
  const newNextChargeDate = calculateNextChargeDate(
    contribution.frequency,
    contribution.nextChargeDate
  );

  return prisma.recurringContribution.update({
    where: { id },
    data: { nextChargeDate: newNextChargeDate },
  });
}

// Get recurring contribution history
export async function getContributionHistory(
  id: string,
  userId: string,
  limit: number = 20
) {
  // Verify ownership
  const contribution = await prisma.recurringContribution.findFirst({
    where: { id, userId },
  });

  if (!contribution) {
    throw new Error('Recurring contribution not found');
  }

  return prisma.recurringContributionHistory.findMany({
    where: { recurringContributionId: id },
    orderBy: { chargeDate: 'desc' },
    take: limit,
  });
}

// Get all recurring activity for a user (contributions + subscriptions)
export async function getAllUserRecurring(userId: string) {
  const [contribution, projectSubs, communitySubs] = await Promise.all([
    prisma.recurringContribution.findFirst({
      where: {
        userId,
        status: { in: ['active', 'paused'] },
      },
    }),
    prisma.projectSubscription.findMany({
      where: {
        userId,
        status: { in: ['active', 'paused'] },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            fundingGoal: true,
            fundingRaised: true,
            status: true,
          },
        },
      },
    }),
    prisma.communitySubscription.findMany({
      where: {
        userId,
        status: { in: ['active', 'paused'] },
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    }),
  ]);

  return {
    watershed: contribution,
    projects: projectSubs,
    communities: communitySubs,
  };
}

// Calculate monthly recurring total for a user
export async function getMonthlyRecurringTotal(userId: string): Promise<number> {
  const recurring = await getAllUserRecurring(userId);

  // Convert all to monthly equivalent
  const toMonthly = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return amount * 4.33; // Average weeks per month
      case 'biweekly':
        return amount * 2.17;
      default:
        return amount;
    }
  };

  let total = 0;

  if (recurring.watershed) {
    total += toMonthly(recurring.watershed.amount, recurring.watershed.frequency);
  }

  for (const sub of recurring.projects) {
    total += toMonthly(sub.amount, sub.frequency);
  }

  for (const sub of recurring.communities) {
    total += toMonthly(sub.amount, sub.frequency);
  }

  return Math.round(total * 100) / 100;
}

// Pause all recurring for a user (for pause all feature)
export async function pauseAllRecurring(userId: string, pauseUntil?: Date) {
  const pauseData = {
    status: 'paused',
    pausedUntil: pauseUntil || null,
  };

  await Promise.all([
    prisma.recurringContribution.updateMany({
      where: { userId, status: 'active' },
      data: pauseData,
    }),
    prisma.projectSubscription.updateMany({
      where: { userId, status: 'active' },
      data: pauseData,
    }),
    prisma.communitySubscription.updateMany({
      where: { userId, status: 'active' },
      data: pauseData,
    }),
  ]);

  return { success: true };
}

// Resume all recurring for a user
export async function resumeAllRecurring(userId: string) {
  const now = new Date();
  const nextMonth = calculateNextChargeDate('monthly');

  await Promise.all([
    prisma.recurringContribution.updateMany({
      where: { userId, status: 'paused' },
      data: {
        status: 'active',
        pausedUntil: null,
        nextChargeDate: nextMonth,
      },
    }),
    prisma.projectSubscription.updateMany({
      where: { userId, status: 'paused' },
      data: {
        status: 'active',
        pausedUntil: null,
        nextChargeDate: nextMonth,
      },
    }),
    prisma.communitySubscription.updateMany({
      where: { userId, status: 'paused' },
      data: {
        status: 'active',
        pausedUntil: null,
        nextChargeDate: nextMonth,
      },
    }),
  ]);

  return { success: true };
}
