import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdvocate } from '@/lib/advocates';
import { logActivity, getActivityHistory, ActivityType } from '@/lib/advocates/activities';

// GET - Get activity history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const advocate = await getAdvocate(session.user.id);
    if (!advocate) {
      return NextResponse.json({ error: 'Not an advocate' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ActivityType | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities = await getActivityHistory(advocate.id, {
      type: type || undefined,
      limit,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Failed to get activities:', error);
    return NextResponse.json(
      { error: 'Failed to get activities' },
      { status: 500 }
    );
  }
}

// POST - Log an activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const advocate = await getAdvocate(session.user.id);
    if (!advocate) {
      return NextResponse.json({ error: 'Not an advocate' }, { status: 403 });
    }

    const body = await request.json();
    const { type, description, communityId } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Type and description are required' },
        { status: 400 }
      );
    }

    const activity = await logActivity(advocate.id, {
      type,
      description,
      communityId,
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Failed to log activity:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to log activity' },
      { status: 500 }
    );
  }
}
