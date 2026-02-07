import { prisma } from './prisma';
import { calculateNextChargeDate } from './recurring';

type AllocationRule = 'newest' | 'neediest' | 'random';

// Subscribe to a community
export async function subscribeToCommunity(
  userId: string,
  communityId: string,
  amount: number,
  frequency: string = 'monthly',
  allocationRule: AllocationRule = 'neediest'
) {
  // Check community exists
  const community = await prisma.community.findUnique({
    where: { id: communityId },
  });

  if (!community) {
    throw new Error('Community not found');
  }

  // Check for existing subscription
  const existing = await prisma.communitySubscription.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('You already have an active subscription to this community');
    }
    // Reactivate cancelled/paused subscription
    return prisma.communitySubscription.update({
      where: { id: existing.id },
      data: {
        amount,
        frequency,
        allocationRule,
        status: 'active',
        nextChargeDate: calculateNextChargeDate(frequency),
        pausedUntil: null,
      },
    });
  }

  return prisma.communitySubscription.create({
    data: {
      userId,
      communityId,
      amount,
      frequency,
      allocationRule,
      nextChargeDate: calculateNextChargeDate(frequency),
      status: 'active',
    },
  });
}

// Get user's community subscriptions
export async function getUserCommunitySubscriptions(userId: string) {
  return prisma.communitySubscription.findMany({
    where: {
      userId,
      status: { in: ['active', 'paused'] },
    },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          memberCount: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Update community subscription
export async function updateCommunitySubscription(
  id: string,
  userId: string,
  updates: {
    amount?: number;
    frequency?: string;
    allocationRule?: AllocationRule;
  }
) {
  const subscription = await prisma.communitySubscription.findFirst({
    where: { id, userId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  let nextChargeDate = subscription.nextChargeDate;
  if (updates.frequency && updates.frequency !== subscription.frequency) {
    nextChargeDate = calculateNextChargeDate(
      updates.frequency,
      subscription.lastChargeDate || new Date()
    );
  }

  return prisma.communitySubscription.update({
    where: { id },
    data: {
      ...updates,
      nextChargeDate,
    },
  });
}

// Cancel community subscription
export async function cancelCommunitySubscription(id: string, userId: string) {
  const subscription = await prisma.communitySubscription.findFirst({
    where: { id, userId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return prisma.communitySubscription.update({
    where: { id },
    data: { status: 'cancelled' },
  });
}

// Pause community subscription
export async function pauseCommunitySubscription(
  id: string,
  userId: string,
  pauseUntil?: Date
) {
  const subscription = await prisma.communitySubscription.findFirst({
    where: { id, userId, status: 'active' },
  });

  if (!subscription) {
    throw new Error('Active subscription not found');
  }

  return prisma.communitySubscription.update({
    where: { id },
    data: {
      status: 'paused',
      pausedUntil: pauseUntil || null,
    },
  });
}

// Resume community subscription
export async function resumeCommunitySubscription(id: string, userId: string) {
  const subscription = await prisma.communitySubscription.findFirst({
    where: { id, userId, status: 'paused' },
  });

  if (!subscription) {
    throw new Error('Paused subscription not found');
  }

  return prisma.communitySubscription.update({
    where: { id },
    data: {
      status: 'active',
      pausedUntil: null,
      nextChargeDate: calculateNextChargeDate(subscription.frequency),
    },
  });
}

// Get project to allocate based on rule
export async function getProjectForAllocation(
  communityId: string,
  rule: AllocationRule
) {
  // Get all active projects linked to this community
  const communityProjects = await prisma.communityProject.findMany({
    where: { communityId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          fundingGoal: true,
          fundingRaised: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  // Filter to active, not-yet-funded projects
  const activeProjects = communityProjects
    .map((cp) => cp.project)
    .filter(
      (p) =>
        p.status === 'active' && p.fundingRaised < p.fundingGoal
    );

  if (activeProjects.length === 0) {
    return null;
  }

  switch (rule) {
    case 'newest':
      // Most recently created
      return activeProjects.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )[0];

    case 'neediest':
      // Closest to goal (highest percentage funded)
      return activeProjects.sort((a, b) => {
        const aPercent = a.fundingRaised / a.fundingGoal;
        const bPercent = b.fundingRaised / b.fundingGoal;
        return bPercent - aPercent; // Higher percentage first
      })[0];

    case 'random':
      return activeProjects[Math.floor(Math.random() * activeProjects.length)];

    default:
      return activeProjects[0];
  }
}

// Get subscription stats for a community
export async function getCommunitySubscriptionStats(communityId: string) {
  const subscriptions = await prisma.communitySubscription.findMany({
    where: {
      communityId,
      status: 'active',
    },
    select: {
      amount: true,
      frequency: true,
    },
  });

  const toMonthly = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return amount * 4.33;
      case 'biweekly':
        return amount * 2.17;
      default:
        return amount;
    }
  };

  const monthlyTotal = subscriptions.reduce(
    (sum, sub) => sum + toMonthly(sub.amount, sub.frequency),
    0
  );

  return {
    subscriberCount: subscriptions.length,
    monthlyRecurring: Math.round(monthlyTotal * 100) / 100,
  };
}

// Get active projects count for a community
export async function getCommunityActiveProjectsCount(communityId: string) {
  return prisma.communityProject.count({
    where: {
      communityId,
      project: {
        status: 'active',
      },
    },
  });
}
