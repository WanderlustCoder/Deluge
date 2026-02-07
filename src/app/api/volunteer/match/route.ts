import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMatchingOpportunities } from '@/lib/skills';

// GET /api/volunteer/match - Find opportunities matching user's skills
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const opportunities = await getMatchingOpportunities(session.user.id, limit);

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}
