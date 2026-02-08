// GET /api/mentorship/match - Get mentor suggestions for current user

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMentorSuggestions, getMenteeSuggestions } from '@/lib/mentorship/smart-matching';
import { getMenteeProfile, getMentorByUserId } from '@/lib/mentorship';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is a mentee seeking a mentor
    const menteeProfile = await getMenteeProfile(session.user.id);

    if (menteeProfile && menteeProfile.status === 'seeking') {
      const suggestions = await getMentorSuggestions(session.user.id, 5);
      return NextResponse.json({
        role: 'mentee',
        suggestions,
      });
    }

    // Check if user is a mentor looking for mentees
    const mentorProfile = await getMentorByUserId(session.user.id);

    if (mentorProfile && mentorProfile.status === 'active' && mentorProfile.isAccepting) {
      const suggestions = await getMenteeSuggestions(session.user.id, 5);
      return NextResponse.json({
        role: 'mentor',
        suggestions,
      });
    }

    // User is neither a seeking mentee nor an accepting mentor
    return NextResponse.json({
      role: null,
      suggestions: [],
      message: 'Create a mentee profile to see mentor suggestions, or enable accepting mentees in your mentor profile.',
    });
  } catch (error) {
    console.error('Error getting match suggestions:', error);
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}
