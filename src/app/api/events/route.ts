/**
 * Events API
 * Plan 30: Fundraising Events & Ticketing
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createEvent, browseEvents, getUserEvents, type EventType, type EventFormat } from '@/lib/events';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const myEvents = searchParams.get('my') === 'true';

    if (myEvents) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const events = await getUserEvents(session.user.id);
      return NextResponse.json({ events });
    }

    const options = {
      communityId: searchParams.get('communityId') || undefined,
      type: (searchParams.get('type') as EventType) || undefined,
      format: (searchParams.get('format') as EventFormat) || undefined,
      upcoming: searchParams.get('upcoming') === 'true',
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    };

    const result = await browseEvents(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in events GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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
      projectId,
      title,
      description,
      type,
      format,
      startDate,
      endDate,
      timezone,
      venue,
      address,
      virtualUrl,
      imageUrl,
      coverImageUrl,
      goalAmount,
      ticketingEnabled,
      donationsEnabled,
      registrationRequired,
      capacity,
    } = body;

    if (!communityId || !title || !description || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'communityId, title, description, type, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const event = await createEvent({
      communityId,
      organizerId: session.user.id,
      projectId,
      title,
      description,
      type,
      format,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timezone,
      venue,
      address,
      virtualUrl,
      imageUrl,
      coverImageUrl,
      goalAmount,
      ticketingEnabled,
      donationsEnabled,
      registrationRequired,
      capacity,
    });

    return NextResponse.json({ event, success: true });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
