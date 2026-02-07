import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserVolunteerStats, getCommunityVolunteerStats } from '@/lib/volunteer';

// GET /api/volunteer/stats - Get volunteer stats
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');

    if (communityId) {
      const stats = await getCommunityVolunteerStats(communityId);
      return NextResponse.json({ stats });
    }

    const stats = await getUserVolunteerStats(session.user.id);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
