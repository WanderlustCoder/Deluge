import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDispute, addDisputeNote } from '@/lib/credit-reporting/disputes';

// GET - Get dispute details
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
    const dispute = await getDispute(id);

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Verify ownership (unless admin)
    if (dispute.userId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Filter out internal notes for non-admins
    if (session.user.accountType !== 'admin') {
      dispute.notes = dispute.notes.filter((n) => !n.isInternal);
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

// POST - Add note to dispute
export async function POST(
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

    if (!body.content) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const dispute = await getDispute(id);

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Verify ownership (unless admin)
    if (dispute.userId !== session.user.id && session.user.accountType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Non-admins can only add non-internal notes
    const isInternal = session.user.accountType === 'admin' && body.isInternal !== false;

    const note = await addDisputeNote(id, session.user.id, body.content, isInternal);

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Failed to add note:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
}
