import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  createDispute,
  getUserDisputes,
  type CreateDisputeData,
} from '@/lib/credit-reporting/disputes';

// GET - Get user's disputes
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const disputes = await getUserDisputes(session.user.id);

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error('Failed to get disputes:', error);
    return NextResponse.json(
      { error: 'Failed to get disputes' },
      { status: 500 }
    );
  }
}

// POST - Create new dispute
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.loanId || !body.disputeType || !body.description) {
      return NextResponse.json(
        { error: 'Loan ID, dispute type, and description are required' },
        { status: 400 }
      );
    }

    // Validate dispute type
    const validTypes = ['balance', 'payment_history', 'account_status', 'identity'];
    if (!validTypes.includes(body.disputeType)) {
      return NextResponse.json(
        { error: 'Invalid dispute type' },
        { status: 400 }
      );
    }

    const disputeData: CreateDisputeData = {
      loanId: body.loanId,
      disputeType: body.disputeType,
      description: body.description,
      evidence: body.evidence ? JSON.stringify(body.evidence) : undefined,
    };

    const dispute = await createDispute(session.user.id, disputeData);

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (error) {
    console.error('Failed to create dispute:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create dispute' },
      { status: 500 }
    );
  }
}
