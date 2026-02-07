import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { castVote, getProposal } from '@/lib/circle-proposals';
import { isCircleMember } from '@/lib/circles';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const proposal = await getProposal(id);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (!(await isCircleMember(proposal.circleId, session.user.id))) {
      return NextResponse.json({ error: 'Membership required' }, { status: 403 });
    }

    if (!['yes', 'no', 'abstain'].includes(body.vote)) {
      return NextResponse.json(
        { error: 'Invalid vote. Must be yes, no, or abstain' },
        { status: 400 }
      );
    }

    const updatedProposal = await castVote(
      id,
      session.user.id,
      body.vote,
      body.comment
    );

    return NextResponse.json({ proposal: updatedProposal });
  } catch (error) {
    console.error('Failed to cast vote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cast vote' },
      { status: 400 }
    );
  }
}
