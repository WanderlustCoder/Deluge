import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPromoCodeStats, deactivatePromoCode, activatePromoCode } from '@/lib/promos';

// GET /api/promos/[id] - Get promo code stats (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const stats = await getPromoCodeStats(id);

    if (!stats) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    );
  }
}

// PATCH /api/promos/[id] - Activate/deactivate promo code (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    const promoCode = isActive
      ? await activatePromoCode(id)
      : await deactivatePromoCode(id);

    return NextResponse.json({
      success: true,
      promoCode,
      message: `Promo code ${isActive ? 'activated' : 'deactivated'}`,
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}
