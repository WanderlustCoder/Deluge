'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createScheduledGift,
  getUserScheduledGifts,
  getUpcomingScheduledGifts,
  getCalendarMonth,
  getScheduledTotal,
} from '@/lib/giving-calendar';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const status = searchParams.get('status') as 'scheduled' | 'completed' | 'skipped' | 'failed' | undefined;

    // Calendar month view
    if (view === 'month') {
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
      const calendar = await getCalendarMonth(session.user.id, year, month);
      return NextResponse.json({ calendar });
    }

    // Upcoming gifts
    if (view === 'upcoming') {
      const days = parseInt(searchParams.get('days') || '30');
      const gifts = await getUpcomingScheduledGifts(session.user.id, days);
      return NextResponse.json({ gifts });
    }

    // Total scheduled for period
    if (view === 'total') {
      const startDate = new Date(searchParams.get('startDate') || new Date().toISOString());
      const endDate = new Date(searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      const total = await getScheduledTotal(session.user.id, startDate, endDate);
      return NextResponse.json({ total });
    }

    // Default: list all scheduled gifts
    const limit = parseInt(searchParams.get('limit') || '50');
    const gifts = await getUserScheduledGifts(session.user.id, { status, limit });

    return NextResponse.json({ gifts });
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.scheduledDate || !body.amount) {
      return NextResponse.json(
        { error: 'Scheduled date and amount are required' },
        { status: 400 }
      );
    }

    if (body.amount < 0.25) {
      return NextResponse.json(
        { error: 'Minimum amount is $0.25' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(body.scheduledDate);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    const gift = await createScheduledGift(session.user.id, {
      occasionId: body.occasionId,
      customOccasion: body.customOccasion,
      scheduledDate,
      amount: body.amount,
      projectId: body.projectId,
      communityId: body.communityId,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      message: body.message,
    });

    return NextResponse.json({ gift }, { status: 201 });
  } catch (error) {
    console.error('Failed to create scheduled gift:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled gift' },
      { status: 500 }
    );
  }
}
