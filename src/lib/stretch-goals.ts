import { prisma } from "@/lib/prisma";
import { STRETCH_GOALS } from "@/lib/constants";

/**
 * Add a stretch goal to a loan application.
 * Stretch goals are funded in priority order after the primary loan amount.
 */
export async function addStretchGoal(
  loanId: string,
  priority: number,
  amount: number,
  purpose: string
) {
  // Check current goal count
  const existingGoals = await prisma.loanStretchGoal.count({
    where: { loanId },
  });

  if (existingGoals >= STRETCH_GOALS.maxCount) {
    throw new Error(`Maximum of ${STRETCH_GOALS.maxCount} stretch goals allowed`);
  }

  // Validate priority
  if (priority < 1 || priority > STRETCH_GOALS.maxCount) {
    throw new Error(`Priority must be between 1 and ${STRETCH_GOALS.maxCount}`);
  }

  // Check if priority already exists
  const existing = await prisma.loanStretchGoal.findUnique({
    where: { loanId_priority: { loanId, priority } },
  });

  if (existing) {
    throw new Error(`Stretch goal with priority ${priority} already exists`);
  }

  return prisma.loanStretchGoal.create({
    data: {
      loanId,
      priority,
      amount,
      purpose,
    },
  });
}

/**
 * Remove a stretch goal from a loan.
 */
export async function removeStretchGoal(loanId: string, priority: number) {
  return prisma.loanStretchGoal.delete({
    where: { loanId_priority: { loanId, priority } },
  });
}

/**
 * Calculate how funding should be distributed between primary loan and stretch goals.
 * Primary amount is funded first, then stretch goals in priority order.
 */
export function calculateFundingDistribution(
  primaryAmount: number,
  stretchGoals: Array<{ priority: number; amount: number }>,
  totalRaised: number
): {
  primaryFunded: number;
  stretchFunding: Array<{ priority: number; funded: number; remaining: number }>;
  surplus: number;
} {
  let remaining = totalRaised;

  // Fund primary first
  const primaryFunded = Math.min(primaryAmount, remaining);
  remaining -= primaryFunded;

  // Sort stretch goals by priority and fund in order
  const sortedGoals = [...stretchGoals].sort((a, b) => a.priority - b.priority);
  const stretchFunding = sortedGoals.map((goal) => {
    const funded = Math.min(goal.amount, remaining);
    remaining -= funded;
    return {
      priority: goal.priority,
      funded,
      remaining: goal.amount - funded,
    };
  });

  return {
    primaryFunded,
    stretchFunding,
    surplus: remaining,
  };
}

/**
 * Resolve stretch goals when funding deadline is reached.
 * Marks goals as funded or unfunded based on actual amounts raised.
 */
export async function resolveStretchGoals(loanId: string) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      stretchGoals: { orderBy: { priority: "asc" } },
      shares: true,
    },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  // Calculate total raised
  const totalRaised = loan.shares.reduce((sum, s) => sum + s.amount, 0);

  // Calculate distribution
  const distribution = calculateFundingDistribution(
    loan.amount,
    loan.stretchGoals.map((g) => ({ priority: g.priority, amount: g.amount })),
    totalRaised
  );

  // Update each stretch goal
  for (const funding of distribution.stretchFunding) {
    const isFunded = funding.remaining === 0;
    await prisma.loanStretchGoal.update({
      where: { loanId_priority: { loanId, priority: funding.priority } },
      data: { funded: isFunded },
    });
  }

  return distribution;
}

/**
 * Get stretch goals for a loan with funding status.
 */
export async function getStretchGoals(loanId: string) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      stretchGoals: { orderBy: { priority: "asc" } },
      shares: true,
    },
  });

  if (!loan) {
    return [];
  }

  const totalRaised = loan.shares.reduce((sum, s) => sum + s.amount, 0);
  const distribution = calculateFundingDistribution(
    loan.amount,
    loan.stretchGoals.map((g) => ({ priority: g.priority, amount: g.amount })),
    totalRaised
  );

  return loan.stretchGoals.map((goal) => {
    const funding = distribution.stretchFunding.find((f) => f.priority === goal.priority);
    return {
      ...goal,
      amountFunded: funding?.funded || 0,
      percentFunded: goal.amount > 0 ? ((funding?.funded || 0) / goal.amount) * 100 : 0,
    };
  });
}
