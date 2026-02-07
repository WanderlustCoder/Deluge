import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOpportunity, updateOpportunity, parseSkills } from '@/lib/volunteer';

// GET /api/volunteer/opportunities/[id] - Get single opportunity
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opportunity = await getOpportunity(id);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Parse skills JSON
    const formattedOpportunity = {
      ...opportunity,
      skillsRequired: parseSkills(opportunity.skillsRequired),
    };

    return NextResponse.json({ opportunity: formattedOpportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

// PATCH /api/volunteer/opportunities/[id] - Update opportunity
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const opportunity = await updateOpportunity(id, body);

    return NextResponse.json({ success: true, opportunity });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    const message = error instanceof Error ? error.message : 'Failed to update opportunity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
