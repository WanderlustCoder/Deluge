import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPromoCode, listPromoCodes, generatePromoCode } from '@/lib/promos';

// GET /api/promos - List promo codes (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await listPromoCodes({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST /api/promos - Create a promo code (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      type,
      value,
      valueType,
      minPurchase,
      maxDiscount,
      usageLimit,
      userLimit,
      validFrom,
      validUntil,
      applicableTo,
    } = body;

    // Generate code if not provided
    const promoCode = code || generatePromoCode();

    if (!type || !['discount', 'bonus_credit', 'free_card'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid type required (discount, bonus_credit, or free_card)' },
        { status: 400 }
      );
    }

    if (typeof value !== 'number' || value <= 0) {
      return NextResponse.json(
        { error: 'Value must be a positive number' },
        { status: 400 }
      );
    }

    if (valueType === 'percentage' && value > 100) {
      return NextResponse.json(
        { error: 'Percentage value cannot exceed 100' },
        { status: 400 }
      );
    }

    try {
      const created = await createPromoCode({
        code: promoCode,
        type,
        value,
        valueType,
        minPurchase,
        maxDiscount,
        usageLimit,
        userLimit,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        applicableTo,
        createdBy: session.user.id,
      });

      return NextResponse.json({
        success: true,
        promoCode: created,
        message: 'Promo code created successfully',
      });
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
