import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adjustCredit } from '@/lib/credits';

// POST /api/credits/adjust - Admin adjust user's store credit
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin only
    if (session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, amount, reason } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json(
        { error: 'Amount must be a non-zero number' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const result = await adjustCredit(userId, amount, reason);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Adjustment would result in negative balance' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      message: `Credit adjusted by $${amount.toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error adjusting credit:', error);
    return NextResponse.json(
      { error: 'Failed to adjust credit' },
      { status: 500 }
    );
  }
}
