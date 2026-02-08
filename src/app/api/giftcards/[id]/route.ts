import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGiftCardById, cancelGiftCard } from '@/lib/giftcards';
import { use } from 'react';

// GET /api/giftcards/[id] - Get gift card details
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
    const giftCard = await getGiftCardById(id);

    if (!giftCard) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 });
    }

    // Check if user has access (purchaser, redeemer, or admin)
    const isOwner =
      giftCard.purchaserId === session.user.id ||
      giftCard.redeemedBy === session.user.id;
    const isAdmin = session.user.accountType === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ giftCard });
  } catch (error) {
    console.error('Error fetching gift card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gift card' },
      { status: 500 }
    );
  }
}

// DELETE /api/giftcards/[id] - Cancel a gift card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const giftCard = await getGiftCardById(id);

    if (!giftCard) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 });
    }

    // Only purchaser or admin can cancel
    const isPurchaser = giftCard.purchaserId === session.user.id;
    const isAdmin = session.user.accountType === 'admin';

    if (!isPurchaser && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      await cancelGiftCard(id);
      return NextResponse.json({
        success: true,
        message: 'Gift card cancelled successfully',
      });
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error cancelling gift card:', error);
    return NextResponse.json(
      { error: 'Failed to cancel gift card' },
      { status: 500 }
    );
  }
}
