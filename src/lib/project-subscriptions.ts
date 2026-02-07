import { prisma } from './prisma';
import { calculateNextChargeDate } from './recurring';

// Subscribe to a project
export async function subscribeToProject(
  userId: string,
  projectId: string,
  amount: number,
  frequency: string = 'monthly'
) {
  // Check project exists and is active
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  if (project.status === 'completed') {
    throw new Error('Cannot subscribe to a completed project');
  }

  // Check for existing subscription
  const existing = await prisma.projectSubscription.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('You already have an active subscription to this project');
    }
    // Reactivate cancelled/paused subscription
    return prisma.projectSubscription.update({
      where: { id: existing.id },
      data: {
        amount,
        frequency,
        status: 'active',
        nextChargeDate: calculateNextChargeDate(frequency),
        pausedUntil: null,
        pauseReason: null,
      },
    });
  }

  return prisma.projectSubscription.create({
    data: {
      userId,
      projectId,
      amount,
      frequency,
      nextChargeDate: calculateNextChargeDate(frequency),
      status: 'active',
    },
  });
}

// Get user's project subscriptions
export async function getUserProjectSubscriptions(userId: string) {
  return prisma.projectSubscription.findMany({
    where: {
      userId,
      status: { in: ['active', 'paused'] },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          fundingGoal: true,
          fundingRaised: true,
          status: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Update project subscription
export async function updateProjectSubscription(
  id: string,
  userId: string,
  updates: {
    amount?: number;
    frequency?: string;
  }
) {
  const subscription = await prisma.projectSubscription.findFirst({
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

  return prisma.projectSubscription.update({
    where: { id },
    data: {
      ...updates,
      nextChargeDate,
    },
  });
}

// Cancel project subscription
export async function cancelProjectSubscription(id: string, userId: string) {
  const subscription = await prisma.projectSubscription.findFirst({
    where: { id, userId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return prisma.projectSubscription.update({
    where: { id },
    data: { status: 'cancelled' },
  });
}

// Pause project subscription
export async function pauseProjectSubscription(
  id: string,
  userId: string,
  pauseUntil?: Date
) {
  const subscription = await prisma.projectSubscription.findFirst({
    where: { id, userId, status: 'active' },
  });

  if (!subscription) {
    throw new Error('Active subscription not found');
  }

  return prisma.projectSubscription.update({
    where: { id },
    data: {
      status: 'paused',
      pausedUntil: pauseUntil || null,
      pauseReason: 'user_paused',
    },
  });
}

// Resume project subscription
export async function resumeProjectSubscription(id: string, userId: string) {
  const subscription = await prisma.projectSubscription.findFirst({
    where: { id, userId, status: 'paused' },
    include: { project: true },
  });

  if (!subscription) {
    throw new Error('Paused subscription not found');
  }

  // Check if project is still fundable
  if (subscription.project.status === 'completed') {
    throw new Error('This project has been completed and no longer accepts funding');
  }

  if (subscription.project.fundingRaised >= subscription.project.fundingGoal) {
    throw new Error('This project has reached its funding goal');
  }

  return prisma.projectSubscription.update({
    where: { id },
    data: {
      status: 'active',
      pausedUntil: null,
      pauseReason: null,
      nextChargeDate: calculateNextChargeDate(subscription.frequency),
    },
  });
}

// Auto-pause subscriptions for funded projects
export async function autoHandleFundedProjects() {
  // Find projects that just hit their goal
  const fundedProjects = await prisma.project.findMany({
    where: {
      fundingRaised: { gte: prisma.project.fields.fundingGoal },
      status: 'active', // Not yet marked as funded
    },
  });

  for (const project of fundedProjects) {
    // Pause all subscriptions with reason
    await prisma.projectSubscription.updateMany({
      where: {
        projectId: project.id,
        status: 'active',
      },
      data: {
        status: 'paused',
        pauseReason: 'project_funded',
      },
    });
  }

  return fundedProjects.length;
}

// Get subscription count for a project
export async function getProjectSubscriptionCount(projectId: string) {
  return prisma.projectSubscription.count({
    where: {
      projectId,
      status: 'active',
    },
  });
}

// Get monthly recurring amount for a project
export async function getProjectMonthlyRecurring(projectId: string): Promise<number> {
  const subscriptions = await prisma.projectSubscription.findMany({
    where: {
      projectId,
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

  return subscriptions.reduce(
    (sum, sub) => sum + toMonthly(sub.amount, sub.frequency),
    0
  );
}

// Find similar projects for subscription redirect
export async function findSimilarProjects(
  projectId: string,
  limit: number = 3
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      communities: {
        select: { communityId: true },
      },
    },
  });

  if (!project) return [];

  const communityIds = project.communities.map((c) => c.communityId);

  // Find active projects in same category or communities
  return prisma.project.findMany({
    where: {
      id: { not: projectId },
      status: 'active',
      OR: [
        { category: project.category },
        {
          communities: {
            some: { communityId: { in: communityIds } },
          },
        },
      ],
    },
    orderBy: [
      { fundingRaised: 'desc' }, // Prioritize projects with some momentum
    ],
    take: limit,
    select: {
      id: true,
      title: true,
      category: true,
      fundingGoal: true,
      fundingRaised: true,
      imageUrl: true,
    },
  });
}
