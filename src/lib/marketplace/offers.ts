/**
 * Marketplace Offers & Negotiations
 * Plan 29: Community Marketplace
 */

import { prisma } from '@/lib/prisma';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'withdrawn';

/**
 * Create an offer on a listing
 */
export async function createOffer(
  listingId: string,
  buyerId: string,
  amount: number,
  message?: string
): Promise<{ id: string }> {
  // Check listing exists and is active
  const listing = await prisma.marketplaceListing.findFirst({
    where: { id: listingId, status: 'active' },
  });

  if (!listing) {
    throw new Error('Listing not found or not available');
  }

  // Can't make offer on own listing
  if (listing.sellerId === buyerId) {
    throw new Error('Cannot make offer on your own listing');
  }

  // Create offer
  const offer = await prisma.listingOffer.create({
    data: {
      listingId,
      buyerId,
      amount,
      message,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    select: { id: true },
  });

  return offer;
}

/**
 * Get offers for a listing (seller view)
 */
export async function getListingOffers(
  listingId: string,
  sellerId: string
): Promise<
  Array<{
    id: string;
    buyerId: string;
    buyerName: string;
    amount: number;
    message: string | null;
    status: string;
    createdAt: Date;
    expiresAt: Date;
  }>
> {
  // Verify ownership
  const listing = await prisma.marketplaceListing.findFirst({
    where: { id: listingId, sellerId },
  });

  if (!listing) return [];

  const offers = await prisma.listingOffer.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
  });

  // Get buyer info
  const buyerIds = [...new Set(offers.map((o) => o.buyerId))];
  const buyers = await prisma.user.findMany({
    where: { id: { in: buyerIds } },
    select: { id: true, name: true },
  });
  const buyerMap = Object.fromEntries(buyers.map((b) => [b.id, b.name]));

  return offers.map((o) => ({
    id: o.id,
    buyerId: o.buyerId,
    buyerName: buyerMap[o.buyerId] || 'Unknown',
    amount: o.amount,
    message: o.message,
    status: o.status,
    createdAt: o.createdAt,
    expiresAt: o.expiresAt,
  }));
}

/**
 * Get user's offers (buyer view)
 */
export async function getUserOffers(
  userId: string
): Promise<
  Array<{
    id: string;
    listingId: string;
    listingTitle: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>
> {
  const offers = await prisma.listingOffer.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { id: true, title: true } },
    },
  });

  return offers.map((o) => ({
    id: o.id,
    listingId: o.listing.id,
    listingTitle: o.listing.title,
    amount: o.amount,
    status: o.status,
    createdAt: o.createdAt,
  }));
}

/**
 * Respond to an offer (accept/reject/counter)
 */
export async function respondToOffer(
  offerId: string,
  sellerId: string,
  response: 'accept' | 'reject' | 'counter',
  counterAmount?: number
): Promise<boolean> {
  const offer = await prisma.listingOffer.findUnique({
    where: { id: offerId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!offer || offer.listing.sellerId !== sellerId) {
    return false;
  }

  if (offer.status !== 'pending') {
    return false;
  }

  if (response === 'accept') {
    await prisma.listingOffer.update({
      where: { id: offerId },
      data: { status: 'accepted' },
    });
    return true;
  }

  if (response === 'reject') {
    await prisma.listingOffer.update({
      where: { id: offerId },
      data: { status: 'rejected' },
    });
    return true;
  }

  if (response === 'counter' && counterAmount !== undefined) {
    await prisma.listingOffer.update({
      where: { id: offerId },
      data: {
        status: 'countered',
        counterAmount,
      },
    });
    return true;
  }

  return false;
}

/**
 * Respond to a counter-offer (accept/reject)
 */
export async function respondToCounter(
  offerId: string,
  buyerId: string,
  accept: boolean
): Promise<boolean> {
  const offer = await prisma.listingOffer.findFirst({
    where: { id: offerId, buyerId, status: 'countered' },
  });

  if (!offer) return false;

  await prisma.listingOffer.update({
    where: { id: offerId },
    data: { status: accept ? 'accepted' : 'rejected' },
  });

  return true;
}

/**
 * Withdraw an offer
 */
export async function withdrawOffer(offerId: string, buyerId: string): Promise<boolean> {
  const result = await prisma.listingOffer.updateMany({
    where: {
      id: offerId,
      buyerId,
      status: { in: ['pending', 'countered'] },
    },
    data: { status: 'withdrawn' },
  });

  return result.count > 0;
}
