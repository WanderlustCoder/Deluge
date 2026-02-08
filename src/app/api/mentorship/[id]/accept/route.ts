// POST /api/mentorship/[id]/accept - Accept a mentorship request

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { acceptMentorship } from '@/lib/mentorship';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const mentorship = await acceptMentorship(id, session.user.id);
    return NextResponse.json(mentorship);
  } catch (error) {
    console.error('Error accepting mentorship:', error);
    const message = error instanceof Error ? error.message : 'Failed to accept mentorship';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
