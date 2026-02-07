import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  subscribeToCommunity,
  updateCommunitySubscription,
  cancelCommunitySubscription,
  pauseCommunitySubscription,
  resumeCommunitySubscription,
  getCommunitySubscriptionStats,
} from '@/lib/community-subscriptions';
import { prisma } from '@/lib/prisma';

// GET /api/communities/[id]/subscribe - Get subscription info for a community
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Get community subscription stats
    const stats = await getCommunitySubscriptionStats(id);

    // Check if current user is subscribed
    let userSubscription = null;
    if (session?.user?.id) {
      userSubscription = await prisma.communitySubscription.findUnique({
        where: {
          userId_communityId: {
            userId: session.user.id,
            communityId: id,
          },
        },
      });
    }

    return NextResponse.json({
      ...stats,
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

// POST /api/communities/[id]/subscribe - Subscribe to a community
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
    const { amount, frequency, allocationRule } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validRules = ['newest', 'neediest', 'random'];
    if (allocationRule && !validRules.includes(allocationRule)) {
      return NextResponse.json(
        { error: 'Invalid allocation rule' },
        { status: 400 }
      );
    }

    const subscription = await subscribeToCommunity(
      session.user.id,
      id,
      amount,
      frequency || 'monthly',
      allocationRule || 'neediest'
    );

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error subscribing:', error);
    const message = error instanceof Error ? error.message : 'Failed to subscribe';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/communities/[id]/subscribe - Update or manage subscription
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: communityId } = await params;
    const body = await request.json();
    const { action, amount, frequency, allocationRule, pauseUntil } = body;

    // Get the subscription
    const subscription = await prisma.communitySubscription.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
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
        result = await pauseCommunitySubscription(
          subscription.id,
          session.user.id,
          pauseUntil ? new Date(pauseUntil) : undefined
        );
        break;

      case 'resume':
        result = await resumeCommunitySubscription(subscription.id, session.user.id);
        break;

      case 'update':
        result = await updateCommunitySubscription(subscription.id, session.user.id, {
          amount,
          frequency,
          allocationRule,
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

// DELETE /api/communities/[id]/subscribe - Cancel subscription
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: communityId } = await params;

    const subscription = await prisma.communitySubscription.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    await cancelCommunitySubscription(subscription.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
