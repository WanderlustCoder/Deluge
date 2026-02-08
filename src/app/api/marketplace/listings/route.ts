/**
 * Marketplace Listings API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createListing,
  browseListings,
  getUserListings,
  type ListingType,
  type ListingStatus,
} from '@/lib/marketplace/listings';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const myListings = searchParams.get('my') === 'true';

    if (myListings) {
      const status = searchParams.get('status') as ListingStatus | null;
      const listings = await getUserListings(session.user.id, status || undefined);
      return NextResponse.json({ listings });
    }

    // Browse listings
    const options = {
      communityId: searchParams.get('communityId') || undefined,
      category: searchParams.get('category') || undefined,
      type: (searchParams.get('type') as ListingType) || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice')
        ? parseFloat(searchParams.get('minPrice')!)
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? parseFloat(searchParams.get('maxPrice')!)
        : undefined,
      limit: parseInt(searchParams.get('limit') || '20', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    };

    const result = await browseListings(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in marketplace listings GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      communityId,
      title,
      description,
      type,
      category,
      subcategory,
      price,
      pricingType,
      images,
      condition,
      location,
      isDeliverable,
      deliveryRadius,
      quantity,
      tags,
      donatePercent,
    } = body;

    if (!communityId || !title || !description || !type || !category) {
      return NextResponse.json(
        { error: 'communityId, title, description, type, and category are required' },
        { status: 400 }
      );
    }

    const listing = await createListing({
      sellerId: session.user.id,
      communityId,
      title,
      description,
      type,
      category,
      subcategory,
      price,
      pricingType,
      images,
      condition,
      location,
      isDeliverable,
      deliveryRadius,
      quantity,
      tags,
      donatePercent,
    });

    return NextResponse.json({ listing, success: true });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
