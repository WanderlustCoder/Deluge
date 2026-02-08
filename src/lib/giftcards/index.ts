import { prisma } from '@/lib/prisma';
import { generateGiftCardCode } from './codes';

export type GiftCardType = 'standard' | 'promotional' | 'reward' | 'refund';
export type GiftCardStatus = 'pending' | 'active' | 'redeemed' | 'expired' | 'cancelled';
export type DeliveryMethod = 'email' | 'print' | 'physical';

export interface CreateGiftCardInput {
  purchaserId?: string;
  recipientEmail?: string;
  recipientName?: string;
  amount: number;
  type?: GiftCardType;
  designId?: string;
  personalMessage?: string;
  deliveryMethod?: DeliveryMethod;
  deliveryDate?: Date;
  expiresAt?: Date;
}

export interface GiftCardFilter {
  purchaserId?: string;
  redeemedBy?: string;
  status?: GiftCardStatus;
  type?: GiftCardType;
  limit?: number;
  offset?: number;
}

// Create a new gift card
export async function createGiftCard(input: CreateGiftCardInput) {
  const code = await generateGiftCardCode();

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      purchaserId: input.purchaserId,
      recipientEmail: input.recipientEmail,
      recipientName: input.recipientName,
      amount: input.amount,
      balance: input.amount,
      type: input.type || 'standard',
      designId: input.designId,
      personalMessage: input.personalMessage,
      deliveryMethod: input.deliveryMethod || 'email',
      deliveryDate: input.deliveryDate,
      expiresAt: input.expiresAt,
      status: input.deliveryDate && input.deliveryDate > new Date() ? 'pending' : 'active',
    },
    include: {
      design: true,
      purchaser: { select: { id: true, name: true, email: true } },
    },
  });

  return giftCard;
}

// Get gift card by code
export async function getGiftCardByCode(code: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { code },
    include: {
      design: true,
      purchaser: { select: { id: true, name: true } },
      redeemer: { select: { id: true, name: true } },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  return giftCard;
}

// Get gift card by ID
export async function getGiftCardById(id: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id },
    include: {
      design: true,
      purchaser: { select: { id: true, name: true, email: true } },
      redeemer: { select: { id: true, name: true, email: true } },
      transactions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return giftCard;
}

// List gift cards with filters
export async function listGiftCards(filter: GiftCardFilter) {
  const { purchaserId, redeemedBy, status, type, limit = 20, offset = 0 } = filter;

  const where: Record<string, unknown> = {};
  if (purchaserId) where.purchaserId = purchaserId;
  if (redeemedBy) where.redeemedBy = redeemedBy;
  if (status) where.status = status;
  if (type) where.type = type;

  const [giftCards, total] = await Promise.all([
    prisma.giftCard.findMany({
      where,
      include: {
        design: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.giftCard.count({ where }),
  ]);

  return { giftCards, total };
}

// Get user's gift cards (purchased and received)
export async function getUserGiftCards(userId: string) {
  const [purchased, received] = await Promise.all([
    prisma.giftCard.findMany({
      where: { purchaserId: userId },
      include: { design: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.giftCard.findMany({
      where: { redeemedBy: userId, balance: { gt: 0 } },
      include: { design: true },
      orderBy: { redeemedAt: 'desc' },
    }),
  ]);

  return { purchased, received };
}

// Check gift card balance
export async function checkBalance(code: string): Promise<{
  valid: boolean;
  balance: number;
  status: string;
  message?: string;
}> {
  const giftCard = await prisma.giftCard.findUnique({
    where: { code },
  });

  if (!giftCard) {
    return { valid: false, balance: 0, status: 'not_found', message: 'Gift card not found' };
  }

  if (giftCard.status === 'cancelled') {
    return { valid: false, balance: 0, status: 'cancelled', message: 'This gift card has been cancelled' };
  }

  if (giftCard.status === 'expired' || (giftCard.expiresAt && giftCard.expiresAt < new Date())) {
    return { valid: false, balance: 0, status: 'expired', message: 'This gift card has expired' };
  }

  if (giftCard.balance <= 0) {
    return { valid: false, balance: 0, status: 'depleted', message: 'This gift card has no remaining balance' };
  }

  return { valid: true, balance: giftCard.balance, status: giftCard.status };
}

// Cancel a gift card
export async function cancelGiftCard(id: string, reason?: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id },
  });

  if (!giftCard) {
    throw new Error('Gift card not found');
  }

  if (giftCard.status === 'redeemed' || giftCard.balance < giftCard.amount) {
    throw new Error('Cannot cancel a gift card that has been partially or fully used');
  }

  const updatedCard = await prisma.giftCard.update({
    where: { id },
    data: {
      status: 'cancelled',
    },
  });

  return updatedCard;
}

// Get gift card designs
export async function getGiftCardDesigns(category?: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;

  const designs = await prisma.giftCardDesign.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  return designs;
}

// Calculate bulk order discount
export function calculateBulkDiscount(quantity: number, denomination: number): {
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
} {
  let discountPercent = 0;

  if (quantity >= 10 && denomination >= 100) {
    discountPercent = 3;
  } else if (quantity >= 10 && denomination >= 50) {
    discountPercent = 2;
  } else if (quantity >= 50) {
    discountPercent = 5;
  }

  const subtotal = quantity * denomination;
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAmount = subtotal - discountAmount;

  return { discountPercent, discountAmount, totalAmount };
}

// Get total user gift card balance
export async function getUserGiftCardBalance(userId: string): Promise<number> {
  const result = await prisma.giftCard.aggregate({
    where: {
      redeemedBy: userId,
      status: 'active',
      balance: { gt: 0 },
    },
    _sum: { balance: true },
  });

  return result._sum.balance || 0;
}
