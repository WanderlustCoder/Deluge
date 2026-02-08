// POST /api/mentorship/apply - Apply to become a mentor

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyToBecomeMentor, getMentorByUserId } from '@/lib/mentorship';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bio, expertise, availability, maxMentees, preferredStyle, languages, timezone } = body;

    if (!bio || !expertise || !availability || !preferredStyle) {
      return NextResponse.json(
        { error: 'Bio, expertise, availability, and preferred style are required' },
        { status: 400 }
      );
    }

    // Check if already a mentor
    const existing = await getMentorByUserId(session.user.id);
    if (existing) {
      return NextResponse.json(
        { error: 'You already have a mentor profile' },
        { status: 400 }
      );
    }

    const mentor = await applyToBecomeMentor(session.user.id, {
      bio,
      expertise,
      availability,
      maxMentees,
      preferredStyle,
      languages,
      timezone,
    });

    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    console.error('Error applying to become mentor:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

// GET /api/mentorship/apply - Get current user's mentor profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mentor = await getMentorByUserId(session.user.id);

    if (!mentor) {
      return NextResponse.json({ mentor: null });
    }

    return NextResponse.json({
      mentor: {
        ...mentor,
        expertise: JSON.parse(mentor.expertise),
        languages: JSON.parse(mentor.languages),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
