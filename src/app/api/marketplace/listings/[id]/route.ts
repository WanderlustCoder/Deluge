/**
 * Single Listing API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getListingById,
  updateListing,
  removeListing,
  markAsSold,
} from '@/lib/marketplace/listings';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, ...updateData } = body;

    // Handle special actions
    if (action === 'mark_sold') {
      const success = await markAsSold(id, session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to mark as sold' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // Regular update
    const success = await updateListing(id, session.user.id, updateData);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update listing or not authorized' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const success = await removeListing(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove listing or not authorized' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing listing:', error);
    return NextResponse.json(
      { error: 'Failed to remove listing' },
      { status: 500 }
    );
  }
}
