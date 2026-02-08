/**
 * Single Offer API
 * Plan 29: Community Marketplace
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  respondToOffer,
  respondToCounter,
  withdrawOffer,
} from '@/lib/marketplace/offers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action, counterAmount } = await request.json();

    // Seller actions: accept, reject, counter
    if (action === 'accept' || action === 'reject' || action === 'counter') {
      const success = await respondToOffer(
        id,
        session.user.id,
        action,
        counterAmount
      );
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to respond to offer' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // Buyer actions: accept_counter, reject_counter
    if (action === 'accept_counter' || action === 'reject_counter') {
      const accept = action === 'accept_counter';
      const success = await respondToCounter(id, session.user.id, accept);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to respond to counter' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error responding to offer:', error);
    return NextResponse.json(
      { error: 'Failed to respond to offer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const success = await withdrawOffer(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to withdraw offer' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error withdrawing offer:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw offer' },
      { status: 500 }
    );
  }
}
