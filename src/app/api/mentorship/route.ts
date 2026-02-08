// GET /api/mentorship - Get user's mentorships

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserMentorships } from '@/lib/mentorship';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mentorships = await getUserMentorships(session.user.id);

    // Parse JSON fields
    const asMentor = mentorships.asMentor.map(ship => ({
      ...ship,
      goals: JSON.parse(ship.goals),
    }));

    const asMentee = mentorships.asMentee.map(ship => ({
      ...ship,
      goals: JSON.parse(ship.goals),
    }));

    return NextResponse.json({ asMentor, asMentee });
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    return NextResponse.json({ error: 'Failed to fetch mentorships' }, { status: 500 });
  }
}
