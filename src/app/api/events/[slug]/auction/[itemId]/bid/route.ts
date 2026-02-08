/**
 * Auction Bid API
 * Plan 30: Fundraising Events & Ticketing
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { placeBid, getAuctionItem } from '@/lib/events/auctions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const item = await getAuctionItem(itemId);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching auction item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction item' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await params;
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid bid amount is required' },
        { status: 400 }
      );
    }

    const result = await placeBid(itemId, session.user.id, amount);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to place bid' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, isWinning: result.isWinning });
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    );
  }
}
