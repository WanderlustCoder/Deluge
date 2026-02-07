import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdvocate } from '@/lib/advocates';
import { getEvent, updateEvent, rsvpToEvent, cancelRsvp } from '@/lib/advocates/events';

// GET - Get event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if user has RSVP'd
    const userRsvp = event.rsvps.find((r) => r.userId === session.user.id);

    return NextResponse.json({ event, userRsvp });
  } catch (error) {
    console.error('Failed to get event:', error);
    return NextResponse.json(
      { error: 'Failed to get event' },
      { status: 500 }
    );
  }
}

// PUT - Update event (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const advocate = await getAdvocate(session.user.id);
    if (!advocate) {
      return NextResponse.json({ error: 'Not an advocate' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const event = await updateEvent(id, advocate.id, {
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date ? new Date(body.date) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      location: body.location,
      isVirtual: body.isVirtual,
      virtualLink: body.virtualLink,
      recap: body.recap,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 500 }
    );
  }
}

// POST - RSVP to event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'cancel') {
      await cancelRsvp(id, session.user.id);
      return NextResponse.json({ success: true, cancelled: true });
    }

    const rsvp = await rsvpToEvent(id, {
      userId: session.user.id,
      name: body.name,
    });

    return NextResponse.json({ rsvp });
  } catch (error) {
    console.error('Failed to RSVP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to RSVP' },
      { status: 500 }
    );
  }
}
