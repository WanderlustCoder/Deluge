import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOpportunity, listOpportunities } from '@/lib/volunteer';

// GET /api/volunteer/opportunities - List opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const projectId = searchParams.get('projectId') || undefined;
    const skill = searchParams.get('skill') || undefined;
    const isRemote = searchParams.get('isRemote');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const opportunities = await listOpportunities({
      status,
      projectId,
      skill,
      isRemote: isRemote ? isRemote === 'true' : undefined,
      limit,
      offset,
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error listing opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to list opportunities' },
      { status: 500 }
    );
  }
}

// POST /api/volunteer/opportunities - Create opportunity
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      title,
      description,
      hoursNeeded,
      skillsRequired,
      location,
      isRemote,
      startDate,
      endDate,
      maxVolunteers,
    } = body;

    if (!projectId || !title || !description) {
      return NextResponse.json(
        { error: 'Project ID, title, and description are required' },
        { status: 400 }
      );
    }

    const opportunity = await createOpportunity(projectId, {
      title,
      description,
      hoursNeeded,
      skillsRequired,
      location,
      isRemote,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      maxVolunteers,
    });

    return NextResponse.json({ success: true, opportunity });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    const message = error instanceof Error ? error.message : 'Failed to create opportunity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
