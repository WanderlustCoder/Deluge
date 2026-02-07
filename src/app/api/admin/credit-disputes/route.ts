import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOpenDisputes, getDisputeStats } from '@/lib/credit-reporting/disputes';
import { getDisputesApproachingDeadline, getOverdueDisputes } from '@/lib/credit-reporting/compliance';

// GET - Get all disputes (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'open' | 'investigating' | 'resolved' | 'escalated' | null;
    const urgentOnly = searchParams.get('urgent') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (urgentOnly) {
      // Get approaching deadline and overdue disputes
      const [approaching, overdue] = await Promise.all([
        getDisputesApproachingDeadline(7),
        getOverdueDisputes(),
      ]);

      return NextResponse.json({
        approaching,
        overdue,
        stats: await getDisputeStats(),
      });
    }

    const disputes = await getOpenDisputes({
      status: status || undefined,
      limit,
    });

    const stats = await getDisputeStats();

    return NextResponse.json({ disputes, stats });
  } catch (error) {
    console.error('Failed to get disputes:', error);
    return NextResponse.json(
      { error: 'Failed to get disputes' },
      { status: 500 }
    );
  }
}
