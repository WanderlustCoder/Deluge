import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProposal, getUserVote, getVotingProgress } from '@/lib/circle-proposals';
import { isCircleMember } from '@/lib/circles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const proposal = await getProposal(id);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (!(await isCircleMember(proposal.circleId, session.user.id))) {
      return NextResponse.json({ error: 'Membership required' }, { status: 403 });
    }

    // Get user's vote if any
    const userVote = await getUserVote(id, session.user.id);

    // Calculate voting progress
    const progress = getVotingProgress(proposal);

    return NextResponse.json({
      proposal,
      userVote,
      progress,
    });
  } catch (error) {
    console.error('Failed to get proposal:', error);
    return NextResponse.json(
      { error: 'Failed to get proposal' },
      { status: 500 }
    );
  }
}
