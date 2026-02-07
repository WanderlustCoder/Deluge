import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPendingVerificationChecks, getVerificationStats } from '@/lib/verification';

// GET /api/admin/verification - Get verification overview
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [pendingChecks, stats] = await Promise.all([
      getPendingVerificationChecks(50),
      getVerificationStats(),
    ]);

    return NextResponse.json({ pendingChecks, stats });
  } catch (error) {
    console.error('Error fetching verification data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification data' },
      { status: 500 }
    );
  }
}
