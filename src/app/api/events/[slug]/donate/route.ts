/**
 * Event Donation API
 * Plan 30: Fundraising Events & Ticketing
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEventBySlug } from '@/lib/events';
import { createDonation, completeDonation, getDonationStats, getActiveMatches } from '@/lib/events/donations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const [stats, matches] = await Promise.all([
      getDonationStats(event.id),
      getActiveMatches(event.id),
    ]);

    return NextResponse.json({ stats, matches });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation stats' },
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
    const { slug } = await params;

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!event.donationsEnabled) {
      return NextResponse.json(
        { error: 'Donations are not enabled for this event' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount, donorName, donorEmail, isAnonymous, honoree, message } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const donation = await createDonation({
      eventId: event.id,
      userId: session?.user?.id,
      amount,
      donorName,
      donorEmail,
      isAnonymous,
      honoree,
      message,
    });

    return NextResponse.json({ donation, success: true });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { donationId, paymentRef } = body;

    if (!donationId || !paymentRef) {
      return NextResponse.json(
        { error: 'donationId and paymentRef are required' },
        { status: 400 }
      );
    }

    const success = await completeDonation(donationId, paymentRef);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to complete donation' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing donation:', error);
    return NextResponse.json(
      { error: 'Failed to complete donation' },
      { status: 500 }
    );
  }
}
