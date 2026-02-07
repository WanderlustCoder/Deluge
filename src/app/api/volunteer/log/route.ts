import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logHours, getUserLogs, getUserVolunteerStats } from '@/lib/volunteer';

// GET /api/volunteer/log - Get user's volunteer logs
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const [logs, stats] = await Promise.all([
      getUserLogs(session.user.id, limit),
      getUserVolunteerStats(session.user.id),
    ]);

    return NextResponse.json({ logs, stats });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// POST /api/volunteer/log - Log volunteer hours
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { opportunityId, hours, date, description } = body;

    if (!opportunityId || !hours || !date) {
      return NextResponse.json(
        { error: 'Opportunity ID, hours, and date are required' },
        { status: 400 }
      );
    }

    if (hours <= 0 || hours > 24) {
      return NextResponse.json(
        { error: 'Hours must be between 0 and 24' },
        { status: 400 }
      );
    }

    const log = await logHours(
      opportunityId,
      session.user.id,
      hours,
      new Date(date),
      description
    );

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error logging hours:', error);
    const message = error instanceof Error ? error.message : 'Failed to log hours';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
