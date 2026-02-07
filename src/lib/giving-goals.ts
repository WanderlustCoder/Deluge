import { prisma } from './prisma';

type Period = 'monthly' | 'quarterly' | 'yearly';

// Calculate period start and end dates
function calculatePeriodDates(period: Period, fromDate?: Date) {
  const now = fromDate || new Date();
  let periodStart: Date;
  let periodEnd: Date;

  switch (period) {
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      periodStart = new Date(now.getFullYear(), quarter * 3, 1);
      periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);
      break;
    case 'yearly':
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      throw new Error('Invalid period');
  }

  return { periodStart, periodEnd };
}

// Create a personal giving goal
export async function createGivingGoal(
  userId: string,
  targetAmount: number,
  period: Period
) {
  const { periodStart, periodEnd } = calculatePeriodDates(period);

  // Check for existing active goal in same period
  const existing = await prisma.personalGivingGoal.findFirst({
    where: {
      userId,
      period,
      status: 'active',
      periodStart: { lte: new Date() },
      periodEnd: { gte: new Date() },
    },
  });

  if (existing) {
    throw new Error(`You already have an active ${period} giving goal`);
  }

  // Calculate current amount from contributions in this period
  const contributions = await prisma.contribution.aggregate({
    where: {
      userId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    _sum: { watershedCredit: true },
  });

  const allocations = await prisma.allocation.aggregate({
    where: {
      userId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    _sum: { amount: true },
  });

  const currentAmount =
    (contributions._sum.watershedCredit || 0) + (allocations._sum.amount || 0);

  return prisma.personalGivingGoal.create({
    data: {
      userId,
      targetAmount,
      currentAmount,
      period,
      periodStart,
      periodEnd,
      status: currentAmount >= targetAmount ? 'completed' : 'active',
    },
  });
}

// Get user's active giving goal
export async function getActiveGivingGoal(userId: string) {
  return prisma.personalGivingGoal.findFirst({
    where: {
      userId,
      status: 'active',
      periodEnd: { gte: new Date() },
    },
  });
}

// Get all giving goals for a user
export async function getUserGivingGoals(userId: string, limit: number = 10) {
  return prisma.personalGivingGoal.findMany({
    where: { userId },
    orderBy: { periodStart: 'desc' },
    take: limit,
  });
}

// Update goal progress
export async function updateGoalProgress(userId: string, amountAdded: number) {
  // Find active goal
  const goal = await prisma.personalGivingGoal.findFirst({
    where: {
      userId,
      status: 'active',
      periodEnd: { gte: new Date() },
    },
  });

  if (!goal) return null;

  const newAmount = goal.currentAmount + amountAdded;
  const newStatus = newAmount >= goal.targetAmount ? 'completed' : 'active';

  return prisma.personalGivingGoal.update({
    where: { id: goal.id },
    data: {
      currentAmount: newAmount,
      status: newStatus,
    },
  });
}

// Update goal target
export async function updateGivingGoal(
  id: string,
  userId: string,
  targetAmount: number
) {
  const goal = await prisma.personalGivingGoal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  const newStatus =
    goal.currentAmount >= targetAmount ? 'completed' : goal.status;

  return prisma.personalGivingGoal.update({
    where: { id },
    data: {
      targetAmount,
      status: newStatus,
    },
  });
}

// Delete goal
export async function deleteGivingGoal(id: string, userId: string) {
  const goal = await prisma.personalGivingGoal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  return prisma.personalGivingGoal.delete({
    where: { id },
  });
}

// Check and expire old goals
export async function expireOldGoals() {
  const now = new Date();

  return prisma.personalGivingGoal.updateMany({
    where: {
      status: 'active',
      periodEnd: { lt: now },
    },
    data: { status: 'expired' },
  });
}

// Get goal statistics
export async function getGoalStatistics(userId: string) {
  const goals = await prisma.personalGivingGoal.findMany({
    where: { userId },
  });

  const completed = goals.filter((g) => g.status === 'completed').length;
  const expired = goals.filter((g) => g.status === 'expired').length;
  const total = goals.length;

  const successRate = total > 0 ? (completed / (completed + expired)) * 100 : 0;

  const totalTargeted = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalAchieved = goals
    .filter((g) => g.status === 'completed')
    .reduce((sum, g) => sum + g.targetAmount, 0);

  return {
    totalGoals: total,
    completed,
    expired,
    active: goals.filter((g) => g.status === 'active').length,
    successRate: Math.round(successRate),
    totalTargeted,
    totalAchieved,
  };
}

// Format goal for display
export function formatGoalForDisplay(goal: {
  id: string;
  targetAmount: number;
  currentAmount: number;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  status: string;
}) {
  const progress = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );

  const periodLabels: Record<string, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return {
    ...goal,
    progress,
    remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
    periodLabel: periodLabels[goal.period] || goal.period,
    dateRange: `${formatDate(goal.periodStart)} - ${formatDate(goal.periodEnd)}`,
    formattedTarget: `$${goal.targetAmount.toFixed(2)}`,
    formattedCurrent: `$${goal.currentAmount.toFixed(2)}`,
    formattedRemaining: `$${Math.max(0, goal.targetAmount - goal.currentAmount).toFixed(2)}`,
  };
}
