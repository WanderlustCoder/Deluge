/**
 * Event Auction API
 * Plan 30: Fundraising Events & Ticketing
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEventBySlug } from '@/lib/events';
import { getAuctionItems, getAuctionStats, createAuctionItem } from '@/lib/events/auctions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;

    const [items, stats] = await Promise.all([
      getAuctionItems(event.id, { status, category }),
      getAuctionStats(event.id),
    ]);

    return NextResponse.json({ items, stats });
  } catch (error) {
    console.error('Error fetching auction items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction items' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      images,
      category,
      startingBid,
      bidIncrement,
      reservePrice,
      buyNowPrice,
      donorName,
      estimatedValue,
      biddingStart,
      biddingEnd,
      order,
    } = body;

    if (!title || !description || !startingBid || !biddingStart || !biddingEnd) {
      return NextResponse.json(
        { error: 'title, description, startingBid, biddingStart, and biddingEnd are required' },
        { status: 400 }
      );
    }

    const item = await createAuctionItem({
      eventId: event.id,
      title,
      description,
      images,
      category,
      startingBid,
      bidIncrement,
      reservePrice,
      buyNowPrice,
      donorName,
      estimatedValue,
      biddingStart: new Date(biddingStart),
      biddingEnd: new Date(biddingEnd),
      order,
    });

    return NextResponse.json({ item, success: true });
  } catch (error) {
    console.error('Error creating auction item:', error);
    return NextResponse.json(
      { error: 'Failed to create auction item' },
      { status: 500 }
    );
  }
}
