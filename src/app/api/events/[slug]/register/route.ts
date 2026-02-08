/**
 * Event Registration API
 * Plan 30: Fundraising Events & Ticketing
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEventBySlug } from '@/lib/events';
import { createRegistration, completeRegistration, getRegistrationByCode } from '@/lib/events/registrations';
import { reserveTickets } from '@/lib/events/tickets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Registration code required' },
        { status: 400 }
      );
    }

    const registration = await getRegistrationByCode(code);

    if (!registration || registration.event.slug !== slug) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
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

    if (event.status !== 'published' && event.status !== 'live') {
      return NextResponse.json(
        { error: 'Event is not open for registration' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, phone, tickets, donationAmount } = body;

    if (!email || !firstName || !lastName || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: 'email, firstName, lastName, and tickets are required' },
        { status: 400 }
      );
    }

    // Reserve tickets
    for (const ticketOrder of tickets) {
      const reserved = await reserveTickets(ticketOrder.ticketTypeId, ticketOrder.quantity);
      if (!reserved) {
        return NextResponse.json(
          { error: `Not enough tickets available for ${ticketOrder.ticketTypeId}` },
          { status: 400 }
        );
      }
    }

    // Create registration
    const registration = await createRegistration({
      eventId: event.id,
      userId: session?.user?.id,
      email,
      firstName,
      lastName,
      phone,
      tickets,
      donationAmount,
    });

    return NextResponse.json({ registration, success: true });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { registrationId, paymentRef, tickets, action } = body;

    if (action === 'complete') {
      if (!registrationId || !paymentRef || !tickets) {
        return NextResponse.json(
          { error: 'registrationId, paymentRef, and tickets are required' },
          { status: 400 }
        );
      }

      const success = await completeRegistration(registrationId, paymentRef, tickets);

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to complete registration' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
