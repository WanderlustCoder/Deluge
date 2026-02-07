import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdvocate, updateAdvocate, isAdvocate } from '@/lib/advocates';
import { getActivitySummary, getActivityHistory } from '@/lib/advocates/activities';
import { getAdvocateEvents } from '@/lib/advocates/events';

// GET - Get current user's advocate profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isUserAdvocate = await isAdvocate(session.user.id);
    if (!isUserAdvocate) {
      return NextResponse.json({ isAdvocate: false });
    }

    const advocate = await getAdvocate(session.user.id);
    if (!advocate) {
      return NextResponse.json({ isAdvocate: false });
    }

    const [activitySummary, recentActivities, events] = await Promise.all([
      getActivitySummary(advocate.id),
      getActivityHistory(advocate.id, { limit: 10 }),
      getAdvocateEvents(advocate.id),
    ]);

    return NextResponse.json({
      isAdvocate: true,
      advocate,
      activitySummary,
      recentActivities,
      events,
    });
  } catch (error) {
    console.error('Failed to get advocate profile:', error);
    return NextResponse.json(
      { error: 'Failed to get advocate profile' },
      { status: 500 }
    );
  }
}

// PUT - Update current user's advocate profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isUserAdvocate = await isAdvocate(session.user.id);
    if (!isUserAdvocate) {
      return NextResponse.json({ error: 'Not an advocate' }, { status: 403 });
    }

    const body = await request.json();
    const { region, interests, bio, publicProfile, status } = body;

    // Only allow pausing, not other status changes
    const allowedStatus = status === 'paused' || status === 'active' ? status : undefined;

    const advocate = await updateAdvocate(session.user.id, {
      region,
      interests,
      bio,
      publicProfile,
      status: allowedStatus,
    });

    return NextResponse.json({ advocate });
  } catch (error) {
    console.error('Failed to update advocate profile:', error);
    return NextResponse.json(
      { error: 'Failed to update advocate profile' },
      { status: 500 }
    );
  }
}
