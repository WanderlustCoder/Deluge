import { prisma } from '@/lib/prisma';
import { normalizeCode, isValidCodeFormat } from './codes';

export interface RedemptionResult {
  success: boolean;
  giftCardId?: string;
  balance?: number;
  message: string;
}

// Redeem a gift card code (add to user's account)
export async function redeemGiftCard(code: string, userId: string): Promise<RedemptionResult> {
  // Normalize and validate code format
  const normalizedCode = normalizeCode(code);

  if (!isValidCodeFormat(normalizedCode)) {
    return {
      success: false,
      message: 'Invalid gift card code format',
    };
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: { code: normalizedCode },
  });

  if (!giftCard) {
    return {
      success: false,
      message: 'Gift card not found',
    };
  }

  // Check if already redeemed
  if (giftCard.redeemedBy) {
    if (giftCard.redeemedBy === userId) {
      return {
        success: false,
        message: 'You have already redeemed this gift card',
      };
    }
    return {
      success: false,
      message: 'This gift card has already been redeemed',
    };
  }

  // Check status
  if (giftCard.status === 'cancelled') {
    return {
      success: false,
      message: 'This gift card has been cancelled',
    };
  }

  if (giftCard.status === 'expired' || (giftCard.expiresAt && giftCard.expiresAt < new Date())) {
    return {
      success: false,
      message: 'This gift card has expired',
    };
  }

  if (giftCard.status === 'pending') {
    return {
      success: false,
      message: 'This gift card is not yet active',
    };
  }

  // Redeem the gift card
  await prisma.$transaction(async (tx) => {
    await tx.giftCard.update({
      where: { id: giftCard.id },
      data: {
        redeemedBy: userId,
        redeemedAt: new Date(),
      },
    });

    // Create redemption transaction
    await tx.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        userId,
        type: 'redemption',
        amount: giftCard.amount,
        balanceBefore: giftCard.balance,
        balanceAfter: giftCard.balance,
        description: 'Gift card redeemed',
      },
    });
  });

  return {
    success: true,
    giftCardId: giftCard.id,
    balance: giftCard.balance,
    message: `Gift card redeemed successfully! $${giftCard.balance.toFixed(2)} added to your account.`,
  };
}

// Use gift card balance for a transaction
export async function spendGiftCardBalance(
  giftCardId: string,
  userId: string,
  amount: number,
  reference?: string,
  description?: string
): Promise<RedemptionResult> {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });

  if (!giftCard) {
    return {
      success: false,
      message: 'Gift card not found',
    };
  }

  if (giftCard.redeemedBy !== userId) {
    return {
      success: false,
      message: 'This gift card does not belong to you',
    };
  }

  if (giftCard.status !== 'active') {
    return {
      success: false,
      message: 'This gift card is not active',
    };
  }

  if (giftCard.balance < amount) {
    return {
      success: false,
      message: `Insufficient balance. Available: $${giftCard.balance.toFixed(2)}`,
    };
  }

  const newBalance = giftCard.balance - amount;

  await prisma.$transaction(async (tx) => {
    await tx.giftCard.update({
      where: { id: giftCardId },
      data: {
        balance: newBalance,
        status: newBalance === 0 ? 'redeemed' : 'active',
      },
    });

    await tx.giftCardTransaction.create({
      data: {
        giftCardId,
        userId,
        type: 'usage',
        amount: -amount,
        balanceBefore: giftCard.balance,
        balanceAfter: newBalance,
        reference,
        description: description || 'Balance used',
      },
    });
  });

  return {
    success: true,
    giftCardId,
    balance: newBalance,
    message: `$${amount.toFixed(2)} used from gift card. Remaining balance: $${newBalance.toFixed(2)}`,
  };
}

// Refund to gift card
export async function refundToGiftCard(
  giftCardId: string,
  userId: string,
  amount: number,
  reference?: string,
  description?: string
): Promise<RedemptionResult> {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });

  if (!giftCard) {
    return {
      success: false,
      message: 'Gift card not found',
    };
  }

  if (giftCard.redeemedBy !== userId) {
    return {
      success: false,
      message: 'This gift card does not belong to you',
    };
  }

  const newBalance = giftCard.balance + amount;

  await prisma.$transaction(async (tx) => {
    await tx.giftCard.update({
      where: { id: giftCardId },
      data: {
        balance: newBalance,
        status: 'active',
      },
    });

    await tx.giftCardTransaction.create({
      data: {
        giftCardId,
        userId,
        type: 'refund',
        amount,
        balanceBefore: giftCard.balance,
        balanceAfter: newBalance,
        reference,
        description: description || 'Refund applied',
      },
    });
  });

  return {
    success: true,
    giftCardId,
    balance: newBalance,
    message: `$${amount.toFixed(2)} refunded to gift card. New balance: $${newBalance.toFixed(2)}`,
  };
}

// Get user's available gift card balance
export async function getAvailableGiftCardBalance(userId: string): Promise<{
  totalBalance: number;
  cards: Array<{
    id: string;
    code: string;
    balance: number;
    expiresAt: Date | null;
  }>;
}> {
  const cards = await prisma.giftCard.findMany({
    where: {
      redeemedBy: userId,
      status: 'active',
      balance: { gt: 0 },
    },
    select: {
      id: true,
      code: true,
      balance: true,
      expiresAt: true,
    },
    orderBy: { expiresAt: 'asc' }, // Cards expiring soon first
  });

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  return {
    totalBalance,
    cards: cards.map(card => ({
      ...card,
      code: '****-****-****-' + card.code.slice(-4), // Mask code
    })),
  };
}

// Use balance from multiple gift cards
export async function useBalanceFromMultipleCards(
  userId: string,
  amount: number,
  reference?: string
): Promise<{
  success: boolean;
  amountUsed: number;
  remainingAmount: number;
  cardsUsed: Array<{ id: string; amountUsed: number }>;
}> {
  // Get all active gift cards for user, sorted by expiration
  const cards = await prisma.giftCard.findMany({
    where: {
      redeemedBy: userId,
      status: 'active',
      balance: { gt: 0 },
    },
    orderBy: { expiresAt: 'asc' },
  });

  let remainingAmount = amount;
  const cardsUsed: Array<{ id: string; amountUsed: number }> = [];

  for (const card of cards) {
    if (remainingAmount <= 0) break;

    const amountToUse = Math.min(card.balance, remainingAmount);

    await spendGiftCardBalance(
      card.id,
      userId,
      amountToUse,
      reference,
      `Applied to transaction ${reference || ''}`
    );

    cardsUsed.push({ id: card.id, amountUsed: amountToUse });
    remainingAmount -= amountToUse;
  }

  return {
    success: remainingAmount < amount,
    amountUsed: amount - remainingAmount,
    remainingAmount,
    cardsUsed,
  };
}
