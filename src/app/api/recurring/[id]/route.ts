import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  updateRecurringContribution,
  pauseRecurringContribution,
  resumeRecurringContribution,
  cancelRecurringContribution,
  skipNextCharge,
  getContributionHistory,
} from '@/lib/recurring';

// GET /api/recurring/[id] - Get contribution history
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
    const history = await getContributionHistory(id, session.user.id);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/recurring/[id] - Update recurring contribution
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
    const { action, amount, frequency, paymentMethodId, pauseUntil } = body;

    let result;

    switch (action) {
      case 'pause':
        result = await pauseRecurringContribution(
          id,
          session.user.id,
          pauseUntil ? new Date(pauseUntil) : undefined
        );
        break;

      case 'resume':
        result = await resumeRecurringContribution(id, session.user.id);
        break;

      case 'skip':
        result = await skipNextCharge(id, session.user.id);
        break;

      case 'update':
        result = await updateRecurringContribution(id, session.user.id, {
          amount,
          frequency,
          paymentMethodId,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be pause, resume, skip, or update' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, recurring: result });
  } catch (error) {
    console.error('Error updating recurring:', error);
    const message = error instanceof Error ? error.message : 'Failed to update';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/recurring/[id] - Cancel recurring contribution
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
    await cancelRecurringContribution(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling recurring:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
