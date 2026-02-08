import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redeemGiftCard } from '@/lib/giftcards/redemption';

// POST /api/giftcards/redeem - Redeem a gift card code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Gift card code is required' },
        { status: 400 }
      );
    }

    const result = await redeemGiftCard(code, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      giftCardId: result.giftCardId,
      balance: result.balance,
      message: result.message,
    });
  } catch (error) {
    console.error('Error redeeming gift card:', error);
    return NextResponse.json(
      { error: 'Failed to redeem gift card' },
      { status: 500 }
    );
  }
}
