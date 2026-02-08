import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStoreCreditBalance, getCreditHistory, getExpiringCredits } from '@/lib/credits';

// GET /api/credits - Get user's store credit balance and history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'balance' | 'history' | 'expiring'

    if (view === 'history') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const history = await getCreditHistory(session.user.id, { limit, offset });
      return NextResponse.json(history);
    }

    if (view === 'expiring') {
      const withinDays = parseInt(searchParams.get('days') || '30');
      const expiring = await getExpiringCredits(session.user.id, withinDays);
      return NextResponse.json({ expiringCredits: expiring });
    }

    // Default: get balance
    const balance = await getStoreCreditBalance(session.user.id);
    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error fetching store credit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store credit' },
      { status: 500 }
    );
  }
}
