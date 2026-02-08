/**
 * Marketplace Offers API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOffer, getUserOffers } from '@/lib/marketplace/offers';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offers = await getUserOffers(session.user.id);
    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
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

    const { listingId, amount, message } = await request.json();

    if (!listingId || amount === undefined) {
      return NextResponse.json(
        { error: 'listingId and amount are required' },
        { status: 400 }
      );
    }

    const offer = await createOffer(listingId, session.user.id, amount, message);
    return NextResponse.json({ offer, success: true });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create offer' },
      { status: 500 }
    );
  }
}
