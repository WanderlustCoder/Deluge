import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserMilestones,
  getUncelebratedMilestones,
  markMilestoneCelebrated,
  markMilestoneShared,
  checkPersonalMilestones,
} from '@/lib/celebrations/milestones';

// GET: Get user's milestones
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uncelebratedOnly = searchParams.get('uncelebrated') === 'true';

    if (uncelebratedOnly) {
      const milestones = await getUncelebratedMilestones(session.user.id);
      return NextResponse.json(milestones);
    }

    const milestones = await getUserMilestones(session.user.id);
    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST: Check for new milestones or mark as celebrated/shared
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, milestoneId } = body;

    switch (action) {
      case 'check':
        // Check for new milestones
        const awarded = await checkPersonalMilestones(session.user.id);
        return NextResponse.json({ awarded });

      case 'celebrate':
        if (!milestoneId) {
          return NextResponse.json(
            { error: 'Milestone ID required' },
            { status: 400 }
          );
        }
        await markMilestoneCelebrated(milestoneId);
        return NextResponse.json({ success: true });

      case 'share':
        if (!milestoneId) {
          return NextResponse.json(
            { error: 'Milestone ID required' },
            { status: 400 }
          );
        }
        await markMilestoneShared(milestoneId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error with milestone action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
