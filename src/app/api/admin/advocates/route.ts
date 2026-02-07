import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdvocateStats, getRegionCoverage } from '@/lib/advocates';
import { listPendingInterests, welcomeAdvocate, declineInterest } from '@/lib/advocates/interest';
import { getRecentActivities } from '@/lib/advocates/activities';

// GET - Admin advocate overview
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview';

    if (view === 'pending') {
      const pending = await listPendingInterests();
      return NextResponse.json({ pending });
    }

    if (view === 'activities') {
      const activities = await getRecentActivities();
      return NextResponse.json({ activities });
    }

    // Default: overview
    const [stats, coverage, pending, advocates, recentActivities] = await Promise.all([
      getAdvocateStats(),
      getRegionCoverage(),
      listPendingInterests(10),
      prisma.communityAdvocate.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          _count: {
            select: { activities: true, events: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
        take: 50,
      }),
      getRecentActivities(10),
    ]);

    return NextResponse.json({
      stats,
      coverage,
      pending,
      advocates,
      recentActivities,
    });
  } catch (error) {
    console.error('Failed to get admin advocate data:', error);
    return NextResponse.json(
      { error: 'Failed to get admin advocate data' },
      { status: 500 }
    );
  }
}

// POST - Admin actions (welcome, decline)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, interestId } = body;

    if (!action || !interestId) {
      return NextResponse.json(
        { error: 'Action and interestId are required' },
        { status: 400 }
      );
    }

    if (action === 'welcome') {
      const result = await welcomeAdvocate(interestId, session.user.id);
      return NextResponse.json({ success: true, welcomed: result });
    }

    if (action === 'decline') {
      await declineInterest(interestId);
      return NextResponse.json({ success: true, declined: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to process admin action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process action' },
      { status: 500 }
    );
  }
}
