import { prisma } from '@/lib/prisma';

export type PromoCodeType = 'discount' | 'bonus_credit' | 'free_card';
export type ValueType = 'percentage' | 'fixed';

export interface CreatePromoCodeInput {
  code: string;
  type: PromoCodeType;
  value: number; // Percentage (0-100) or fixed amount
  valueType?: ValueType;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  userLimit?: number;
  validFrom?: Date;
  validUntil?: Date;
  applicableTo?: string[];
  createdBy: string;
}

export interface ValidatePromoResult {
  valid: boolean;
  discountAmount: number;
  message: string;
  promoCode?: {
    id: string;
    code: string;
    type: PromoCodeType;
    value: number;
    valueType: string;
  };
}

// Create a new promo code
export async function createPromoCode(input: CreatePromoCodeInput) {
  const existingCode = await prisma.promoCode.findUnique({
    where: { code: input.code.toUpperCase() },
  });

  if (existingCode) {
    throw new Error('Promo code already exists');
  }

  const now = new Date();
  const defaultExpiry = new Date();
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);

  const promoCode = await prisma.promoCode.create({
    data: {
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      valueType: input.valueType || 'fixed',
      minPurchase: input.minPurchase,
      maxDiscount: input.maxDiscount,
      usageLimit: input.usageLimit,
      userLimit: input.userLimit,
      validFrom: input.validFrom || now,
      validUntil: input.validUntil || defaultExpiry,
      applicableTo: input.applicableTo ? JSON.stringify(input.applicableTo) : null,
      usageCount: 0,
      isActive: true,
      createdBy: input.createdBy,
    },
  });

  return promoCode;
}

// Validate a promo code for a purchase
export async function validatePromoCode(
  code: string,
  userId: string,
  purchaseAmount: number
): Promise<ValidatePromoResult> {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promoCode) {
    return { valid: false, discountAmount: 0, message: 'Promo code not found' };
  }

  if (!promoCode.isActive) {
    return { valid: false, discountAmount: 0, message: 'This promo code is no longer active' };
  }

  // Check date validity
  const now = new Date();
  if (promoCode.validFrom > now) {
    return { valid: false, discountAmount: 0, message: 'This promo code is not yet active' };
  }

  if (promoCode.validUntil < now) {
    return { valid: false, discountAmount: 0, message: 'This promo code has expired' };
  }

  // Check usage limits
  if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
    return { valid: false, discountAmount: 0, message: 'This promo code has reached its usage limit' };
  }

  // Check per-user usage
  if (promoCode.userLimit) {
    const userUsages = await prisma.promoCodeUsage.count({
      where: {
        promoCodeId: promoCode.id,
        userId,
      },
    });

    if (userUsages >= promoCode.userLimit) {
      return { valid: false, discountAmount: 0, message: 'You have already used this promo code the maximum number of times' };
    }
  }

  // Check minimum purchase
  if (promoCode.minPurchase && purchaseAmount < promoCode.minPurchase) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum purchase of $${promoCode.minPurchase.toFixed(2)} required`,
    };
  }

  // Calculate discount
  let discountAmount = 0;

  if (promoCode.valueType === 'percentage') {
    discountAmount = purchaseAmount * (promoCode.value / 100);
  } else {
    discountAmount = promoCode.value;
  }

  // Apply max discount cap
  if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
    discountAmount = promoCode.maxDiscount;
  }

  // Don't exceed purchase amount
  discountAmount = Math.min(discountAmount, purchaseAmount);

  return {
    valid: true,
    discountAmount,
    message: `Promo code applied! You save $${discountAmount.toFixed(2)}`,
    promoCode: {
      id: promoCode.id,
      code: promoCode.code,
      type: promoCode.type as PromoCodeType,
      value: promoCode.value,
      valueType: promoCode.valueType,
    },
  };
}

// Apply a promo code (record usage)
export async function applyPromoCode(
  promoCodeId: string,
  userId: string,
  orderId: string,
  discount: number
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Increment usage count
    await tx.promoCode.update({
      where: { id: promoCodeId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Record usage
    await tx.promoCodeUsage.create({
      data: {
        promoCodeId,
        userId,
        orderId,
        discount,
      },
    });
  });
}

// Get promo code by code
export async function getPromoCode(code: string) {
  return prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });
}

// List all promo codes (admin)
export async function listPromoCodes(options?: {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const { isActive, limit = 20, offset = 0 } = options || {};

  const where: Record<string, unknown> = {};
  if (isActive !== undefined) where.isActive = isActive;

  const [promoCodes, total] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.promoCode.count({ where }),
  ]);

  return { promoCodes, total };
}

// Deactivate a promo code
export async function deactivatePromoCode(id: string) {
  return prisma.promoCode.update({
    where: { id },
    data: { isActive: false },
  });
}

// Activate a promo code
export async function activatePromoCode(id: string) {
  return prisma.promoCode.update({
    where: { id },
    data: { isActive: true },
  });
}

// Get promo code usage stats
export async function getPromoCodeStats(id: string) {
  const promoCode = await prisma.promoCode.findUnique({
    where: { id },
  });

  if (!promoCode) {
    return null;
  }

  const [totalUsages, totalDiscount, uniqueUsers] = await Promise.all([
    prisma.promoCodeUsage.count({
      where: { promoCodeId: id },
    }),
    prisma.promoCodeUsage.aggregate({
      where: { promoCodeId: id },
      _sum: { discount: true },
    }),
    prisma.promoCodeUsage.groupBy({
      by: ['userId'],
      where: { promoCodeId: id },
    }),
  ]);

  return {
    promoCode,
    totalUsages,
    totalDiscount: totalDiscount._sum?.discount || 0,
    uniqueUsers: uniqueUsers.length,
  };
}

// Generate a random promo code
export function generatePromoCode(prefix?: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}${code}` : code;
}
