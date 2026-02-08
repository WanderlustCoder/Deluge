/**
 * Marketplace Transactions
 * Plan 29: Community Marketplace
 */

import { prisma } from '@/lib/prisma';

export type TransactionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

/**
 * Create a transaction from an accepted offer
 */
export async function createTransaction(
  offerId: string,
  sellerId: string
): Promise<{ id: string }> {
  const offer = await prisma.listingOffer.findFirst({
    where: { id: offerId, status: 'accepted' },
    include: {
      listing: {
        select: {
          id: true,
          sellerId: true,
          communityId: true,
          donatePercent: true,
        },
      },
    },
  });

  if (!offer) {
    throw new Error('Offer not found or not accepted');
  }

  if (offer.listing.sellerId !== sellerId) {
    throw new Error('Not authorized');
  }

  const finalAmount = offer.counterAmount || offer.amount;
  const donationAmount = (finalAmount * (offer.listing.donatePercent || 0)) / 100;

  const transaction = await prisma.marketplaceTransaction.create({
    data: {
      listingId: offer.listing.id,
      sellerId: offer.listing.sellerId,
      buyerId: offer.buyerId,
      communityId: offer.listing.communityId,
      amount: finalAmount,
      communityDonation: donationAmount,
      status: 'pending',
    },
    select: { id: true },
  });

  // Mark listing as sold
  await prisma.marketplaceListing.update({
    where: { id: offer.listing.id },
    data: { status: 'sold' },
  });

  return transaction;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  userId: string,
  status: TransactionStatus
): Promise<boolean> {
  const transaction = await prisma.marketplaceTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) return false;

  // Only buyer or seller can update
  if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
    return false;
  }

  // Validate status transitions
  const validTransitions: Record<string, TransactionStatus[]> = {
    pending: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'disputed', 'cancelled'],
    completed: [],
    cancelled: [],
    disputed: ['completed', 'cancelled'],
  };

  if (!validTransitions[transaction.status]?.includes(status)) {
    return false;
  }

  const updateData: Record<string, unknown> = { status };
  if (status === 'completed') {
    updateData.completedAt = new Date();
  }

  await prisma.marketplaceTransaction.update({
    where: { id: transactionId },
    data: updateData,
  });

  return true;
}

/**
 * Get user's transactions
 */
export async function getUserTransactions(
  userId: string,
  role?: 'buyer' | 'seller'
): Promise<
  Array<{
    id: string;
    listingId: string;
    listingTitle: string;
    amount: number;
    status: string;
    role: 'buyer' | 'seller';
    otherPartyName: string;
    createdAt: Date;
    completedAt: Date | null;
  }>
> {
  const where: Record<string, unknown> = {};
  if (role === 'buyer') {
    where.buyerId = userId;
  } else if (role === 'seller') {
    where.sellerId = userId;
  } else {
    where.OR = [{ buyerId: userId }, { sellerId: userId }];
  }

  const transactions = await prisma.marketplaceTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { id: true, title: true } },
      seller: { select: { id: true, name: true } },
      buyer: { select: { id: true, name: true } },
    },
  });

  return transactions.map((t) => ({
    id: t.id,
    listingId: t.listing.id,
    listingTitle: t.listing.title,
    amount: t.amount,
    status: t.status,
    role: t.sellerId === userId ? 'seller' : 'buyer',
    otherPartyName:
      t.sellerId === userId ? t.buyer.name : t.seller.name,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
  }));
}

/**
 * Get transaction details
 */
export async function getTransaction(
  transactionId: string,
  userId: string
): Promise<{
  id: string;
  listing: { id: string; title: string; images: string[] };
  seller: { id: string; name: string };
  buyer: { id: string; name: string };
  amount: number;
  communityDonation: number;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
} | null> {
  const transaction = await prisma.marketplaceTransaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: { select: { id: true, title: true, images: true } },
      seller: { select: { id: true, name: true } },
      buyer: { select: { id: true, name: true } },
    },
  });

  if (!transaction) return null;

  // Only buyer or seller can view
  if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
    return null;
  }

  return {
    id: transaction.id,
    listing: {
      id: transaction.listing.id,
      title: transaction.listing.title,
      images: JSON.parse(transaction.listing.images || '[]'),
    },
    seller: transaction.seller,
    buyer: transaction.buyer,
    amount: transaction.amount,
    communityDonation: transaction.communityDonation,
    status: transaction.status,
    createdAt: transaction.createdAt,
    completedAt: transaction.completedAt,
  };
}

/**
 * Get community marketplace stats
 */
export async function getCommunityTransactionStats(communityId: string): Promise<{
  totalTransactions: number;
  completedTransactions: number;
  totalVolume: number;
  totalDonated: number;
}> {
  const [total, completed, stats] = await Promise.all([
    prisma.marketplaceTransaction.count({ where: { communityId } }),
    prisma.marketplaceTransaction.count({
      where: { communityId, status: 'completed' },
    }),
    prisma.marketplaceTransaction.aggregate({
      where: { communityId, status: 'completed' },
      _sum: { amount: true, communityDonation: true },
    }),
  ]);

  return {
    totalTransactions: total,
    completedTransactions: completed,
    totalVolume: stats._sum.amount || 0,
    totalDonated: stats._sum.communityDonation || 0,
  };
}
