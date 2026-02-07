import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  updateGivingGoal,
  deleteGivingGoal,
  formatGoalForDisplay,
} from '@/lib/giving-goals';
import { prisma } from '@/lib/prisma';

// GET /api/giving-goals/[id] - Get a specific goal
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const goal = await prisma.personalGivingGoal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal: formatGoalForDisplay(goal) });
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

// PATCH /api/giving-goals/[id] - Update a goal
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { targetAmount } = body;

    if (!targetAmount || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    const goal = await updateGivingGoal(id, session.user.id, targetAmount);

    return NextResponse.json({
      success: true,
      goal: formatGoalForDisplay(goal),
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    const message = error instanceof Error ? error.message : 'Failed to update goal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/giving-goals/[id] - Delete a goal
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await deleteGivingGoal(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete goal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
