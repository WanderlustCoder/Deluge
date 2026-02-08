// GET/POST /api/mentorship/mentees - Mentee profile management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOrUpdateMenteeProfile, getMenteeProfile } from '@/lib/mentorship';

// GET - Get current user's mentee profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mentee = await getMenteeProfile(session.user.id);

    if (!mentee) {
      return NextResponse.json({ mentee: null });
    }

    return NextResponse.json({
      mentee: {
        ...mentee,
        goals: JSON.parse(mentee.goals),
      },
    });
  } catch (error) {
    console.error('Error fetching mentee profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST - Create or update mentee profile
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { goals, challenges, preferredStyle, timezone } = body;

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { error: 'At least one learning goal is required' },
        { status: 400 }
      );
    }

    const mentee = await createOrUpdateMenteeProfile(session.user.id, {
      goals,
      challenges,
      preferredStyle,
      timezone,
    });

    return NextResponse.json({
      mentee: {
        ...mentee,
        goals: JSON.parse(mentee.goals),
      },
    });
  } catch (error) {
    console.error('Error updating mentee profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
