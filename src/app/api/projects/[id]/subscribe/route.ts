import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  subscribeToProject,
  updateProjectSubscription,
  cancelProjectSubscription,
  pauseProjectSubscription,
  resumeProjectSubscription,
  getProjectSubscriptionCount,
  getProjectMonthlyRecurring,
} from '@/lib/project-subscriptions';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/subscribe - Get subscription info for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Get project subscription stats
    const [subscriberCount, monthlyRecurring] = await Promise.all([
      getProjectSubscriptionCount(id),
      getProjectMonthlyRecurring(id),
    ]);

    // Check if current user is subscribed
    let userSubscription = null;
    if (session?.user?.id) {
      userSubscription = await prisma.projectSubscription.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: id,
          },
        },
      });
    }

    return NextResponse.json({
      subscriberCount,
      monthlyRecurring,
      userSubscription,
    });
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription info' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/subscribe - Subscribe to a project
export async function POST(
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
    const { amount, frequency } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const subscription = await subscribeToProject(
      session.user.id,
      id,
      amount,
      frequency || 'monthly'
    );

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error subscribing:', error);
    const message = error instanceof Error ? error.message : 'Failed to subscribe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/projects/[id]/subscribe - Update or manage subscription
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { action, amount, frequency, pauseUntil } = body;

    // Get the subscription ID
    const subscription = await prisma.projectSubscription.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case 'pause':
        result = await pauseProjectSubscription(
          subscription.id,
          session.user.id,
          pauseUntil ? new Date(pauseUntil) : undefined
        );
        break;

      case 'resume':
        result = await resumeProjectSubscription(subscription.id, session.user.id);
        break;

      case 'update':
        result = await updateProjectSubscription(subscription.id, session.user.id, {
          amount,
          frequency,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    console.error('Error updating subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to update';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/subscribe - Cancel subscription
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    const subscription = await prisma.projectSubscription.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    await cancelProjectSubscription(subscription.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
