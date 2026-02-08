import { prisma } from '@/lib/prisma';

export type CreditTransactionType = 'earned' | 'spent' | 'expired' | 'adjusted';
export type CreditSource = 'refund' | 'reward' | 'promotion' | 'referral' | 'adjustment';

export interface AddCreditInput {
  userId: string;
  amount: number;
  source: CreditSource;
  reference?: string;
  description?: string;
  expiresAt?: Date;
}

export interface UseCreditInput {
  userId: string;
  amount: number;
  reference?: string;
  description?: string;
}

// Get or create store credit for user
async function getOrCreateStoreCredit(userId: string) {
  let storeCredit = await prisma.storeCredit.findUnique({
    where: { userId },
  });

  if (!storeCredit) {
    storeCredit = await prisma.storeCredit.create({
      data: {
        userId,
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      },
    });
  }

  return storeCredit;
}

// Get user's store credit balance
export async function getStoreCreditBalance(userId: string): Promise<{
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}> {
  const storeCredit = await getOrCreateStoreCredit(userId);

  return {
    balance: storeCredit.balance,
    lifetimeEarned: storeCredit.lifetimeEarned,
    lifetimeSpent: storeCredit.lifetimeSpent,
  };
}

// Add credit to user's account
export async function addCredit(input: AddCreditInput): Promise<{
  success: boolean;
  newBalance: number;
  message: string;
}> {
  const storeCredit = await getOrCreateStoreCredit(input.userId);

  const newBalance = storeCredit.balance + input.amount;

  await prisma.$transaction(async (tx) => {
    await tx.storeCredit.update({
      where: { id: storeCredit.id },
      data: {
        balance: newBalance,
        lifetimeEarned: storeCredit.lifetimeEarned + input.amount,
      },
    });

    await tx.storeCreditTransaction.create({
      data: {
        creditId: storeCredit.id,
        type: 'earned',
        source: input.source,
        amount: input.amount,
        balanceBefore: storeCredit.balance,
        balanceAfter: newBalance,
        reference: input.reference,
        description: input.description,
        expiresAt: input.expiresAt,
      },
    });
  });

  return {
    success: true,
    newBalance,
    message: `$${input.amount.toFixed(2)} credit added to your account`,
  };
}

// Use credit from user's account
export async function useCredit(input: UseCreditInput): Promise<{
  success: boolean;
  amountUsed: number;
  newBalance: number;
  message: string;
}> {
  const storeCredit = await getOrCreateStoreCredit(input.userId);

  if (storeCredit.balance < input.amount) {
    return {
      success: false,
      amountUsed: 0,
      newBalance: storeCredit.balance,
      message: `Insufficient credit balance. Available: $${storeCredit.balance.toFixed(2)}`,
    };
  }

  const newBalance = storeCredit.balance - input.amount;

  await prisma.$transaction(async (tx) => {
    await tx.storeCredit.update({
      where: { id: storeCredit.id },
      data: {
        balance: newBalance,
        lifetimeSpent: storeCredit.lifetimeSpent + input.amount,
      },
    });

    await tx.storeCreditTransaction.create({
      data: {
        creditId: storeCredit.id,
        type: 'spent',
        source: 'adjustment', // Will be overridden by caller if needed
        amount: -input.amount,
        balanceBefore: storeCredit.balance,
        balanceAfter: newBalance,
        reference: input.reference,
        description: input.description,
      },
    });
  });

  return {
    success: true,
    amountUsed: input.amount,
    newBalance,
    message: `$${input.amount.toFixed(2)} credit used`,
  };
}

// Use as much credit as available (for partial payments)
export async function useAvailableCredit(
  userId: string,
  maxAmount: number,
  reference?: string
): Promise<{
  amountUsed: number;
  remainingAmount: number;
  newBalance: number;
}> {
  const storeCredit = await getOrCreateStoreCredit(userId);

  const amountToUse = Math.min(storeCredit.balance, maxAmount);

  if (amountToUse > 0) {
    await useCredit({
      userId,
      amount: amountToUse,
      reference,
      description: `Applied to transaction ${reference || ''}`,
    });
  }

  return {
    amountUsed: amountToUse,
    remainingAmount: maxAmount - amountToUse,
    newBalance: storeCredit.balance - amountToUse,
  };
}

// Get credit transaction history
export async function getCreditHistory(
  userId: string,
  options?: { limit?: number; offset?: number }
) {
  const { limit = 20, offset = 0 } = options || {};

  const storeCredit = await prisma.storeCredit.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!storeCredit) {
    return { transactions: [], total: 0 };
  }

  const [transactions, total] = await Promise.all([
    prisma.storeCreditTransaction.findMany({
      where: { creditId: storeCredit.id },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.storeCreditTransaction.count({
      where: { creditId: storeCredit.id },
    }),
  ]);

  return { transactions, total };
}

// Issue refund as store credit
export async function issueRefundCredit(
  userId: string,
  amount: number,
  reference?: string,
  description?: string
): Promise<{ success: boolean; newBalance: number }> {
  const result = await addCredit({
    userId,
    amount,
    source: 'refund',
    reference,
    description: description || 'Refund issued as store credit',
  });

  return { success: result.success, newBalance: result.newBalance };
}

// Issue promotional credit
export async function issuePromotionalCredit(
  userId: string,
  amount: number,
  expiresAt?: Date,
  description?: string
): Promise<{ success: boolean; newBalance: number }> {
  const result = await addCredit({
    userId,
    amount,
    source: 'promotion',
    expiresAt,
    description: description || 'Promotional credit',
  });

  return { success: result.success, newBalance: result.newBalance };
}

// Issue reward credit (e.g., for badges)
export async function issueRewardCredit(
  userId: string,
  amount: number,
  reference?: string,
  description?: string
): Promise<{ success: boolean; newBalance: number }> {
  const result = await addCredit({
    userId,
    amount,
    source: 'reward',
    reference,
    description: description || 'Reward credit',
  });

  return { success: result.success, newBalance: result.newBalance };
}

// Adjust credit (admin function)
export async function adjustCredit(
  userId: string,
  amount: number, // positive to add, negative to subtract
  reason: string
): Promise<{ success: boolean; newBalance: number }> {
  const storeCredit = await getOrCreateStoreCredit(userId);

  const newBalance = storeCredit.balance + amount;

  if (newBalance < 0) {
    return {
      success: false,
      newBalance: storeCredit.balance,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.storeCredit.update({
      where: { id: storeCredit.id },
      data: {
        balance: newBalance,
        lifetimeEarned: amount > 0 ? storeCredit.lifetimeEarned + amount : storeCredit.lifetimeEarned,
        lifetimeSpent: amount < 0 ? storeCredit.lifetimeSpent + Math.abs(amount) : storeCredit.lifetimeSpent,
      },
    });

    await tx.storeCreditTransaction.create({
      data: {
        creditId: storeCredit.id,
        type: 'adjusted',
        source: 'adjustment',
        amount,
        balanceBefore: storeCredit.balance,
        balanceAfter: newBalance,
        description: reason,
      },
    });
  });

  return {
    success: true,
    newBalance,
  };
}

// Get expiring credits
export async function getExpiringCredits(userId: string, withinDays: number = 30) {
  const storeCredit = await prisma.storeCredit.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!storeCredit) {
    return [];
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + withinDays);

  const expiringTransactions = await prisma.storeCreditTransaction.findMany({
    where: {
      creditId: storeCredit.id,
      type: 'earned',
      expiresAt: {
        not: null,
        lte: expirationDate,
        gt: new Date(),
      },
    },
    orderBy: { expiresAt: 'asc' },
  });

  return expiringTransactions;
}
