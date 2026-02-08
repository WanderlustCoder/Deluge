// GET /api/mentorship/mentors - List active mentors

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listActiveMentors, MentorExpertise, MentorStyle } from '@/lib/mentorship';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const expertise = searchParams.get('expertise') as MentorExpertise | null;
  const style = searchParams.get('style') as MentorStyle | null;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    const result = await listActiveMentors({
      expertise: expertise || undefined,
      style: style || undefined,
      search,
      page,
      limit,
    });

    // Parse JSON fields for each mentor
    const mentors = result.mentors.map(mentor => ({
      ...mentor,
      expertise: JSON.parse(mentor.expertise),
      languages: JSON.parse(mentor.languages),
    }));

    return NextResponse.json({ ...result, mentors });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 });
  }
}
