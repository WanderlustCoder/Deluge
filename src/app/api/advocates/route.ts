import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listAdvocates, getAdvocateStats } from '@/lib/advocates';

// GET - List advocates or get stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || undefined;
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await getAdvocateStats();
      return NextResponse.json({ stats });
    }

    const advocates = await listAdvocates({ region });
    const stats = await getAdvocateStats();

    return NextResponse.json({ advocates, stats });
  } catch (error) {
    console.error('Failed to list advocates:', error);
    return NextResponse.json(
      { error: 'Failed to list advocates' },
      { status: 500 }
    );
  }
}
