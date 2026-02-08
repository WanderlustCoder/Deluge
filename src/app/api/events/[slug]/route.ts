/**
 * Single Event API
 * Plan 30: Fundraising Events & Ticketing
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEventBySlug, updateEvent, publishEvent, getEventStats } from '@/lib/events';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    let stats = null;
    if (includeStats) {
      stats = await getEventStats(event.id);
    }

    return NextResponse.json({ event, stats });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { action, ...updateData } = body;

    // Handle publish action
    if (action === 'publish') {
      const success = await publishEvent(event.id, session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to publish event' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // Handle date parsing
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const success = await updateEvent(event.id, session.user.id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update event or not authorized' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
