import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOpenFlags, getFlagStats, type FlagType } from '@/lib/verification/fraud-detection';

const FLAG_TYPES = new Set<FlagType>([
  'duplicate',
  'suspicious_funding',
  'unresponsive',
  'misuse',
  'fraud',
]);

// GET /api/admin/flags - Get all open flags with stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | null;
    const typeParam = searchParams.get('type');
    const type = typeParam && FLAG_TYPES.has(typeParam as FlagType) ? (typeParam as FlagType) : undefined;

    const [flags, stats] = await Promise.all([
      getOpenFlags({
        severity: severity || undefined,
        type,
        limit: 100,
      }),
      getFlagStats(),
    ]);

    return NextResponse.json({ flags, stats });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flags' },
      { status: 500 }
    );
  }
}
