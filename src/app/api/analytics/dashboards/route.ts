import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDashboard, getUserDashboards } from '@/lib/analytics/dashboards';

// GET /api/analytics/dashboards - List user's dashboards
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboards = await getUserDashboards(session.user.id);

    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/dashboards - Create a new dashboard
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Dashboard name is required' },
        { status: 400 }
      );
    }

    const dashboard = await createDashboard({
      name,
      description,
      ownerId: session.user.id,
      ownerType: 'user',
      isPublic,
    });

    return NextResponse.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}
