/**
 * Event Auctions
 * Plan 30: Fundraising Events & Ticketing
 */

import { prisma } from '@/lib/prisma';

export interface CreateAuctionItemInput {
  eventId: string;
  title: string;
  description: string;
  images?: string[];
  category?: string;
  startingBid: number;
  bidIncrement?: number;
  reservePrice?: number;
  buyNowPrice?: number;
  donorName?: string;
  estimatedValue?: number;
  biddingStart: Date;
  biddingEnd: Date;
  order?: number;
}

/**
 * Create an auction item
 */
export async function createAuctionItem(
  input: CreateAuctionItemInput
): Promise<{ id: string }> {
  const item = await prisma.auctionItem.create({
    data: {
      eventId: input.eventId,
      title: input.title,
      description: input.description,
      images: JSON.stringify(input.images || []),
      category: input.category,
      startingBid: input.startingBid,
      bidIncrement: input.bidIncrement || 5,
      reservePrice: input.reservePrice,
      buyNowPrice: input.buyNowPrice,
      donorName: input.donorName,
      estimatedValue: input.estimatedValue,
      biddingStart: input.biddingStart,
      biddingEnd: input.biddingEnd,
      order: input.order || 0,
      status: 'pending',
    },
    select: { id: true },
  });

  return item;
}

/**
 * Get auction items for an event
 */
export async function getAuctionItems(
  eventId: string,
  options?: { status?: string; category?: string }
): Promise<
  Array<{
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string | null;
    startingBid: number;
    currentBid: number | null;
    bidIncrement: number;
    buyNowPrice: number | null;
    estimatedValue: number | null;
    donorName: string | null;
    biddingStart: Date;
    biddingEnd: Date;
    status: string;
    bidCount: number;
    isActive: boolean;
  }>
> {
  const now = new Date();
  const where: Record<string, unknown> = { eventId };
  if (options?.status) where.status = options.status;
  if (options?.category) where.category = options.category;

  const items = await prisma.auctionItem.findMany({
    where,
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { bids: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    images: JSON.parse(item.images || '[]'),
    category: item.category,
    startingBid: item.startingBid,
    currentBid: item.currentBid,
    bidIncrement: item.bidIncrement,
    buyNowPrice: item.buyNowPrice,
    estimatedValue: item.estimatedValue,
    donorName: item.donorName,
    biddingStart: item.biddingStart,
    biddingEnd: item.biddingEnd,
    status: item.status,
    bidCount: item._count.bids,
    isActive: item.status === 'active' && item.biddingStart <= now && item.biddingEnd > now,
  }));
}

/**
 * Get single auction item with bid history
 */
export async function getAuctionItem(itemId: string) {
  const item = await prisma.auctionItem.findUnique({
    where: { id: itemId },
    include: {
      bids: {
        orderBy: { amount: 'desc' },
        take: 10,
        include: {
          bidder: { select: { id: true, name: true } },
        },
      },
      _count: { select: { bids: true } },
    },
  });

  if (!item) return null;

  const now = new Date();
  const isActive = item.status === 'active' && item.biddingStart <= now && item.biddingEnd > now;

  return {
    ...item,
    images: JSON.parse(item.images || '[]'),
    bidCount: item._count.bids,
    isActive,
    bids: item.bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      bidderName: b.bidder.name,
      isWinning: b.isWinning,
      createdAt: b.createdAt,
    })),
  };
}

/**
 * Place a bid
 */
export async function placeBid(
  itemId: string,
  bidderId: string,
  amount: number
): Promise<{ success: boolean; error?: string; isWinning?: boolean }> {
  const item = await prisma.auctionItem.findUnique({
    where: { id: itemId },
    include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
  });

  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  const now = new Date();
  if (item.status !== 'active' || item.biddingStart > now || item.biddingEnd <= now) {
    return { success: false, error: 'Bidding is not open for this item' };
  }

  const currentHighBid = item.currentBid || item.startingBid;
  const minimumBid = currentHighBid + item.bidIncrement;

  if (amount < minimumBid) {
    return {
      success: false,
      error: `Minimum bid is $${minimumBid.toFixed(2)}`,
    };
  }

  // Check if this is a "Buy Now"
  const isBuyNow = item.buyNowPrice && amount >= item.buyNowPrice;

  // Unmark previous winning bid
  if (item.bids.length > 0) {
    await prisma.auctionBid.update({
      where: { id: item.bids[0].id },
      data: { isWinning: false },
    });
  }

  // Create new bid
  await prisma.auctionBid.create({
    data: {
      itemId,
      bidderId,
      amount,
      isWinning: true,
    },
  });

  // Update item
  await prisma.auctionItem.update({
    where: { id: itemId },
    data: {
      currentBid: amount,
      winnerId: bidderId,
      status: isBuyNow ? 'sold' : 'active',
    },
  });

  return { success: true, isWinning: true };
}

/**
 * Close auction items when bidding ends
 */
export async function closeExpiredAuctions(): Promise<number> {
  const now = new Date();

  const expiredItems = await prisma.auctionItem.findMany({
    where: {
      status: 'active',
      biddingEnd: { lte: now },
    },
  });

  let closedCount = 0;

  for (const item of expiredItems) {
    const meetsReserve = !item.reservePrice || (item.currentBid && item.currentBid >= item.reservePrice);
    const hasBids = item.currentBid !== null;

    await prisma.auctionItem.update({
      where: { id: item.id },
      data: {
        status: hasBids && meetsReserve ? 'sold' : 'unsold',
      },
    });

    closedCount++;
  }

  return closedCount;
}

/**
 * Get auction stats for an event
 */
export async function getAuctionStats(eventId: string): Promise<{
  totalItems: number;
  activeItems: number;
  soldItems: number;
  totalBids: number;
  totalValue: number;
}> {
  const [total, active, sold, bids, value] = await Promise.all([
    prisma.auctionItem.count({ where: { eventId } }),
    prisma.auctionItem.count({ where: { eventId, status: 'active' } }),
    prisma.auctionItem.count({ where: { eventId, status: 'sold' } }),
    prisma.auctionBid.count({ where: { item: { eventId } } }),
    prisma.auctionItem.aggregate({
      where: { eventId, status: 'sold' },
      _sum: { currentBid: true },
    }),
  ]);

  return {
    totalItems: total,
    activeItems: active,
    soldItems: sold,
    totalBids: bids,
    totalValue: value._sum.currentBid || 0,
  };
}

/**
 * Get user's bids
 */
export async function getUserBids(
  userId: string
): Promise<
  Array<{
    id: string;
    itemId: string;
    itemTitle: string;
    eventSlug: string;
    amount: number;
    isWinning: boolean;
    currentHighBid: number | null;
    biddingEnd: Date;
    status: string;
    createdAt: Date;
  }>
> {
  const bids = await prisma.auctionBid.findMany({
    where: { bidderId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      item: {
        include: {
          event: { select: { slug: true } },
        },
      },
    },
  });

  return bids.map((b) => ({
    id: b.id,
    itemId: b.item.id,
    itemTitle: b.item.title,
    eventSlug: b.item.event.slug,
    amount: b.amount,
    isWinning: b.isWinning,
    currentHighBid: b.item.currentBid,
    biddingEnd: b.item.biddingEnd,
    status: b.item.status,
    createdAt: b.createdAt,
  }));
}
