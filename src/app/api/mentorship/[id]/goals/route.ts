// GET/POST /api/mentorship/[id]/goals - Mentee goal management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createMenteeGoal, getMentorshipGoals } from '@/lib/mentorship/goals';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: mentorshipId } = await params;

  try {
    const goals = await getMentorshipGoals(mentorshipId);
    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: mentorshipId } = await params;

  try {
    const body = await request.json();
    const { title, description, targetDate, milestones } = body;

    if (!title) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }

    const goal = await createMenteeGoal(mentorshipId, session.user.id, {
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      milestones,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    const message = error instanceof Error ? error.message : 'Failed to create goal';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
