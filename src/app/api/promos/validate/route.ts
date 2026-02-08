import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validatePromoCode } from '@/lib/promos';

// POST /api/promos/validate - Validate a promo code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, purchaseAmount } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid purchase amount is required' },
        { status: 400 }
      );
    }

    const result = await validatePromoCode(code, session.user.id, purchaseAmount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
