// Discovery challenges API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getActiveChallenges,
  getSuggestedChallenges,
  createChallenge,
  ChallengeType,
} from '@/lib/recommendations/challenges';

// GET - Get user's challenges
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [active, suggested] = await Promise.all([
      getActiveChallenges(session.user.id),
      getSuggestedChallenges(session.user.id),
    ]);

    return NextResponse.json({
      active: active.map((c) => ({
        id: c.id,
        type: c.type,
        target: c.target,
        progress: c.progress,
        reward: c.reward,
        rewardAmount: c.rewardAmount,
        expiresAt: c.expiresAt,
        percentComplete: Math.round((c.progress / c.target) * 100),
      })),
      suggested: suggested.map((d) => ({
        type: d.type,
        title: d.title,
        description: d.description,
        target: d.target,
        reward: d.reward,
        rewardAmount: d.rewardAmount,
        durationDays: d.durationDays,
      })),
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    return NextResponse.json({ error: 'Failed to get challenges' }, { status: 500 });
  }
}

// POST - Start a new challenge
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Challenge type required' }, { status: 400 });
    }

    const result = await createChallenge(session.user.id, type as ChallengeType);

    if (!result) {
      return NextResponse.json(
        { error: 'Unable to create challenge. It may already be active.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ id: result.id, message: 'Challenge started' });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
