import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isCorporateAdmin, getCorporateAccount, getCorporateDashboardStats } from '@/lib/corporate';

// GET /api/corporate/[slug]/stats - Get dashboard stats
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const stats = await getCorporateDashboardStats(account.id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
