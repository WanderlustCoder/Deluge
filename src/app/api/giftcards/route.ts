import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGiftCard, listGiftCards, getUserGiftCards } from '@/lib/giftcards';

// GET /api/giftcards - List user's gift cards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'purchased' | 'received' | 'all'

    if (view === 'all' && session.user.accountType === 'admin') {
      // Admin can list all gift cards
      const status = searchParams.get('status') as 'pending' | 'active' | 'redeemed' | 'expired' | 'cancelled' | null;
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const result = await listGiftCards({
        status: status || undefined,
        limit,
        offset,
      });

      return NextResponse.json(result);
    }

    // Regular user - get their gift cards
    const userCards = await getUserGiftCards(session.user.id);

    return NextResponse.json(userCards);
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gift cards' },
      { status: 500 }
    );
  }
}

// POST /api/giftcards - Purchase a gift card
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      recipientEmail,
      recipientName,
      designId,
      personalMessage,
      deliveryMethod,
      deliveryDate,
    } = body;

    // Validate amount
    if (!amount || amount < 5 || amount > 500) {
      return NextResponse.json(
        { error: 'Gift card amount must be between $5 and $500' },
        { status: 400 }
      );
    }

    // Create the gift card
    const giftCard = await createGiftCard({
      purchaserId: session.user.id,
      recipientEmail,
      recipientName,
      amount,
      type: 'standard',
      designId,
      personalMessage,
      deliveryMethod: deliveryMethod || 'email',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
    });

    // TODO: In production, process payment here before creating the card

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        amount: giftCard.amount,
        recipientEmail: giftCard.recipientEmail,
        recipientName: giftCard.recipientName,
      },
      message: 'Gift card created successfully',
    });
  } catch (error) {
    console.error('Error creating gift card:', error);
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    );
  }
}
