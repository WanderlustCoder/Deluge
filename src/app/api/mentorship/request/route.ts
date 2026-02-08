// POST /api/mentorship/request - Request a mentor

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requestMentor, getMenteeProfile, createOrUpdateMenteeProfile } from '@/lib/mentorship';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mentorId, goals, message } = body;

    if (!mentorId || !goals || goals.length === 0) {
      return NextResponse.json(
        { error: 'Mentor ID and at least one goal are required' },
        { status: 400 }
      );
    }

    // Ensure user has a mentee profile
    let mentee = await getMenteeProfile(session.user.id);

    if (!mentee) {
      // Create a basic mentee profile
      await createOrUpdateMenteeProfile(session.user.id, {
        goals,
        challenges: message,
      });
      // Fetch again to get the full profile with relations
      mentee = await getMenteeProfile(session.user.id);
    }

    if (!mentee) {
      return NextResponse.json({ error: 'Failed to create mentee profile' }, { status: 500 });
    }

    const mentorship = await requestMentor(mentee.id, mentorId, goals);

    return NextResponse.json(mentorship, { status: 201 });
  } catch (error) {
    console.error('Error requesting mentor:', error);
    const message = error instanceof Error ? error.message : 'Failed to request mentor';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
