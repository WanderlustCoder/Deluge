import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPledgeById, updatePledge, cancelPledge } from '@/lib/campaigns/pledges';

// GET /api/pledges/[id] - Get pledge details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pledge = await getPledgeById(id);

    if (!pledge) {
      return NextResponse.json({ error: 'Pledge not found' }, { status: 404 });
    }

    // Only allow user to view their own pledges or campaign creator
    if (pledge.userId !== session.user.id &&
        pledge.campaign.creator.id !== session.user.id &&
        session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ pledge });
  } catch (error) {
    console.error('Error fetching pledge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pledge' },
      { status: 500 }
    );
  }
}

// PATCH /api/pledges/[id] - Update pledge
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: {
      amount?: number;
      tipAmount?: number;
      rewardId?: string | null;
      isAnonymous?: boolean;
      message?: string;
    } = {};

    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
    if (body.tipAmount !== undefined) updateData.tipAmount = parseFloat(body.tipAmount);
    if (body.rewardId !== undefined) updateData.rewardId = body.rewardId;
    if (body.isAnonymous !== undefined) updateData.isAnonymous = body.isAnonymous;
    if (body.message !== undefined) updateData.message = body.message;

    const pledge = await updatePledge(id, session.user.id, updateData);

    return NextResponse.json({ pledge });
  } catch (error) {
    console.error('Error updating pledge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update pledge' },
      { status: 500 }
    );
  }
}

// DELETE /api/pledges/[id] - Cancel pledge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pledge = await cancelPledge(id, session.user.id);

    return NextResponse.json({ pledge });
  } catch (error) {
    console.error('Error cancelling pledge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel pledge' },
      { status: 500 }
    );
  }
}
