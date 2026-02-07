import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdvocate } from '@/lib/advocates';
import { createEvent, listUpcomingEvents, EventType } from '@/lib/advocates/events';

// GET - List upcoming events
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId') || undefined;
    const type = searchParams.get('type') as EventType | null;
    const limit = parseInt(searchParams.get('limit') || '20');

    const events = await listUpcomingEvents({
      communityId,
      type: type || undefined,
      limit,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to list events:', error);
    return NextResponse.json(
      { error: 'Failed to list events' },
      { status: 500 }
    );
  }
}

// POST - Create an event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const advocate = await getAdvocate(session.user.id);
    if (!advocate) {
      return NextResponse.json({ error: 'Not an advocate' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, type, date, endDate, location, isVirtual, virtualLink, communityId } = body;

    if (!title || !description || !type || !date) {
      return NextResponse.json(
        { error: 'Title, description, type, and date are required' },
        { status: 400 }
      );
    }

    const event = await createEvent(advocate.id, {
      title,
      description,
      type,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      isVirtual,
      virtualLink,
      communityId,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 500 }
    );
  }
}
