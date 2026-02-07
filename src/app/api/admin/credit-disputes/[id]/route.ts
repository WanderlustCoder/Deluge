import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getDispute,
  resolveDispute,
  escalateDispute,
  notifyBureausOfResolution,
  updateDisputeStatus,
} from '@/lib/credit-reporting/disputes';

// GET - Get dispute details (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dispute = await getDispute(id);

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error('Failed to get dispute:', error);
    return NextResponse.json(
      { error: 'Failed to get dispute' },
      { status: 500 }
    );
  }
}

// PUT - Update dispute (resolve, escalate, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, resolution, reason } = body;

    const dispute = await getDispute(id);
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    let updatedDispute;

    switch (action) {
      case 'resolve':
        if (!resolution) {
          return NextResponse.json(
            { error: 'Resolution is required' },
            { status: 400 }
          );
        }
        updatedDispute = await resolveDispute(id, session.user.id, resolution);
        break;

      case 'escalate':
        if (!reason) {
          return NextResponse.json(
            { error: 'Escalation reason is required' },
            { status: 400 }
          );
        }
        updatedDispute = await escalateDispute(id, session.user.id, reason);
        break;

      case 'investigating':
        updatedDispute = await updateDisputeStatus(id, 'investigating');
        break;

      case 'notify_bureaus':
        await notifyBureausOfResolution(id);
        updatedDispute = await getDispute(id);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ dispute: updatedDispute });
  } catch (error) {
    console.error('Failed to update dispute:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
