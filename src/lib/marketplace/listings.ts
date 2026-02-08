/**
 * Marketplace Listings Management
 * Plan 29: Community Marketplace
 */

import { prisma } from '@/lib/prisma';

export type ListingType = 'product' | 'service' | 'skill' | 'rental' | 'free';
export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'removed';
export type PricingType = 'fixed' | 'negotiable' | 'hourly' | 'daily';

export interface CreateListingInput {
  sellerId: string;
  communityId: string;
  title: string;
  description: string;
  type: ListingType;
  category: string;
  subcategory?: string;
  price?: number;
  pricingType?: PricingType;
  images?: string[];
  condition?: string;
  location?: string;
  isDeliverable?: boolean;
  deliveryRadius?: number;
  quantity?: number;
  tags?: string[];
  donatePercent?: number;
  expiresAt?: Date;
}

/**
 * Create a new listing
 */
export async function createListing(
  input: CreateListingInput
): Promise<{ id: string }> {
  const listing = await prisma.marketplaceListing.create({
    data: {
      sellerId: input.sellerId,
      communityId: input.communityId,
      title: input.title,
      description: input.description,
      type: input.type,
      category: input.category,
      subcategory: input.subcategory,
      price: input.price,
      pricingType: input.pricingType || 'fixed',
      images: JSON.stringify(input.images || []),
      condition: input.condition,
      location: input.location,
      isDeliverable: input.isDeliverable || false,
      deliveryRadius: input.deliveryRadius,
      quantity: input.quantity || 1,
      tags: JSON.stringify(input.tags || []),
      donatePercent: input.donatePercent || 0,
      expiresAt: input.expiresAt,
      status: 'active',
    },
    select: { id: true },
  });

  return listing;
}

/**
 * Get a listing by ID
 */
export async function getListingById(id: string) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, avatarUrl: true } },
      community: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!listing) return null;

  // Increment view count
  await prisma.marketplaceListing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    ...listing,
    images: JSON.parse(listing.images || '[]'),
    tags: JSON.parse(listing.tags || '[]'),
  };
}

/**
 * Update a listing
 */
export async function updateListing(
  id: string,
  sellerId: string,
  data: Partial<CreateListingInput>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.pricingType !== undefined) updateData.pricingType = data.pricingType;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.isDeliverable !== undefined) updateData.isDeliverable = data.isDeliverable;
  if (data.deliveryRadius !== undefined) updateData.deliveryRadius = data.deliveryRadius;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.donatePercent !== undefined) updateData.donatePercent = data.donatePercent;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
  if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

  const result = await prisma.marketplaceListing.updateMany({
    where: { id, sellerId },
    data: updateData,
  });

  return result.count > 0;
}

/**
 * Delete/remove a listing
 */
export async function removeListing(id: string, sellerId: string): Promise<boolean> {
  const result = await prisma.marketplaceListing.updateMany({
    where: { id, sellerId },
    data: { status: 'removed' },
  });

  return result.count > 0;
}

/**
 * Mark listing as sold
 */
export async function markAsSold(id: string, sellerId: string): Promise<boolean> {
  const result = await prisma.marketplaceListing.updateMany({
    where: { id, sellerId, status: 'active' },
    data: { status: 'sold' },
  });

  return result.count > 0;
}

/**
 * Browse listings with filters
 */
export async function browseListings(options: {
  communityId?: string;
  category?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: ListingStatus;
  limit?: number;
  offset?: number;
}): Promise<{
  listings: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
    price: number | null;
    images: string[];
    status: string;
    createdAt: Date;
    seller: { id: string; name: string };
    community: { id: string; name: string };
  }>;
  total: number;
}> {
  const where: Record<string, unknown> = {
    status: options.status || 'active',
  };

  if (options.communityId) where.communityId = options.communityId;
  if (options.category) where.category = options.category;
  if (options.type) where.type = options.type;

  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where.price = {};
    if (options.minPrice !== undefined) {
      (where.price as Record<string, number>).gte = options.minPrice;
    }
    if (options.maxPrice !== undefined) {
      (where.price as Record<string, number>).lte = options.maxPrice;
    }
  }

  if (options.search) {
    where.OR = [
      { title: { contains: options.search } },
      { description: { contains: options.search } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20,
      skip: options.offset || 0,
      include: {
        seller: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
      },
    }),
    prisma.marketplaceListing.count({ where }),
  ]);

  return {
    listings: listings.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      category: l.category,
      price: l.price,
      images: JSON.parse(l.images || '[]'),
      status: l.status,
      createdAt: l.createdAt,
      seller: l.seller,
      community: l.community,
    })),
    total,
  };
}

/**
 * Get user's listings
 */
export async function getUserListings(
  userId: string,
  status?: ListingStatus
): Promise<
  Array<{
    id: string;
    title: string;
    type: string;
    price: number | null;
    status: string;
    viewCount: number;
    createdAt: Date;
  }>
> {
  return prisma.marketplaceListing.findMany({
    where: {
      sellerId: userId,
      status: status || { in: ['active', 'sold', 'draft'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      price: true,
      status: true,
      viewCount: true,
      createdAt: true,
    },
  });
}

/**
 * Get marketplace stats for a community
 */
export async function getCommunityMarketplaceStats(communityId: string): Promise<{
  activeListings: number;
  totalSold: number;
  totalDonated: number;
  topCategories: Array<{ category: string; count: number }>;
}> {
  const [active, sold, topCategories] = await Promise.all([
    prisma.marketplaceListing.count({
      where: { communityId, status: 'active' },
    }),
    prisma.marketplaceListing.count({
      where: { communityId, status: 'sold' },
    }),
    prisma.marketplaceListing.groupBy({
      by: ['category'],
      where: { communityId, status: 'active' },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    }),
  ]);

  // Calculate total donations
  const transactions = await prisma.marketplaceTransaction.aggregate({
    where: { communityId, status: 'completed' },
    _sum: { communityDonation: true },
  });

  return {
    activeListings: active,
    totalSold: sold,
    totalDonated: transactions._sum.communityDonation || 0,
    topCategories: topCategories.map((c) => ({
      category: c.category,
      count: c._count,
    })),
  };
}
