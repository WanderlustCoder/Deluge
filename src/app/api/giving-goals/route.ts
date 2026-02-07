import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createGivingGoal,
  getActiveGivingGoal,
  getUserGivingGoals,
  getGoalStatistics,
  formatGoalForDisplay,
} from '@/lib/giving-goals';

// GET /api/giving-goals - Get user's giving goals
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const goal = await getActiveGivingGoal(session.user.id);
      return NextResponse.json({
        goal: goal ? formatGoalForDisplay(goal) : null,
      });
    }

    const [goals, stats] = await Promise.all([
      getUserGivingGoals(session.user.id),
      getGoalStatistics(session.user.id),
    ]);

    return NextResponse.json({
      goals: goals.map(formatGoalForDisplay),
      stats,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/giving-goals - Create a new giving goal
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetAmount, period } = body;

    if (!targetAmount || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validPeriods = ['monthly', 'quarterly', 'yearly'];
    if (!period || !validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Period must be monthly, quarterly, or yearly' },
        { status: 400 }
      );
    }

    const goal = await createGivingGoal(session.user.id, targetAmount, period);

    return NextResponse.json({
      success: true,
      goal: formatGoalForDisplay(goal),
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    const message = error instanceof Error ? error.message : 'Failed to create goal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
