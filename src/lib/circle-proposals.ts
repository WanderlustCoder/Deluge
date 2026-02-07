import { prisma } from './prisma';
import { createCircleActivity } from './circle-activity';
import { isCircleMember } from './circles';

// Create a funding proposal
export async function createProposal(
  circleId: string,
  proposerId: string,
  data: {
    type: 'project' | 'loan' | 'custom';
    projectId?: string;
    loanId?: string;
    title: string;
    description?: string;
    amount: number;
  }
) {
  // Verify membership
  if (!(await isCircleMember(circleId, proposerId))) {
    throw new Error('Not a member of this circle');
  }

  // Get circle settings
  const circle = await prisma.givingCircle.findUnique({
    where: { id: circleId },
    select: { votingPeriod: true, pooledBalance: true },
  });

  if (!circle) {
    throw new Error('Circle not found');
  }

  if (data.amount > circle.pooledBalance) {
    throw new Error('Amount exceeds pool balance');
  }

  const votingEnds = new Date(
    Date.now() + circle.votingPeriod * 24 * 60 * 60 * 1000
  );

  // If project type, validate project exists
  if (data.type === 'project' && data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { title: true },
    });
    if (!project) {
      throw new Error('Project not found');
    }
  }

  // If loan type, validate loan exists
  if (data.type === 'loan' && data.loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: data.loanId },
      select: { purpose: true },
    });
    if (!loan) {
      throw new Error('Loan not found');
    }
  }

  const proposer = await prisma.user.findUnique({
    where: { id: proposerId },
    select: { name: true },
  });

  const proposal = await prisma.circleProposal.create({
    data: {
      circleId,
      proposerId,
      type: data.type,
      projectId: data.projectId,
      loanId: data.loanId,
      title: data.title,
      description: data.description,
      amount: data.amount,
      votingEnds,
      status: 'voting',
    },
  });

  await createCircleActivity(circleId, 'proposal_created', proposerId, {
    proposalId: proposal.id,
    title: proposal.title,
    amount: proposal.amount,
    proposerName: proposer?.name,
  });

  return proposal;
}

// Get proposal by ID
export async function getProposal(proposalId: string) {
  return prisma.circleProposal.findUnique({
    where: { id: proposalId },
    include: {
      votes: {
        include: {
          proposal: { select: { circleId: true } },
        },
      },
      circle: {
        select: {
          id: true,
          name: true,
          slug: true,
          votingThreshold: true,
          pooledBalance: true,
          _count: { select: { members: { where: { status: 'active' } } } },
        },
      },
    },
  });
}

// List proposals for a circle
export async function listProposals(
  circleId: string,
  options?: { status?: string; limit?: number; offset?: number }
) {
  const where: Record<string, unknown> = { circleId };

  if (options?.status) {
    where.status = options.status;
  }

  return prisma.circleProposal.findMany({
    where,
    include: {
      _count: { select: { votes: true } },
    },
    orderBy: [{ status: 'asc' }, { votingEnds: 'asc' }],
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// Cast vote
export async function castVote(
  proposalId: string,
  userId: string,
  vote: 'yes' | 'no' | 'abstain',
  comment?: string
) {
  const proposal = await prisma.circleProposal.findUnique({
    where: { id: proposalId },
    select: { circleId: true, status: true, votingEnds: true, title: true },
  });

  if (!proposal) {
    throw new Error('Proposal not found');
  }

  if (proposal.status !== 'voting') {
    throw new Error('Voting has ended');
  }

  if (proposal.votingEnds < new Date()) {
    throw new Error('Voting period has expired');
  }

  // Verify membership
  if (!(await isCircleMember(proposal.circleId, userId))) {
    throw new Error('Not a member of this circle');
  }

  // Check for existing vote
  const existingVote = await prisma.circleVote.findUnique({
    where: { proposalId_userId: { proposalId, userId } },
  });

  const voter = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (existingVote) {
    // Update vote
    const oldVote = existingVote.vote;

    await prisma.$transaction([
      prisma.circleVote.update({
        where: { id: existingVote.id },
        data: { vote, comment },
      }),
      prisma.circleProposal.update({
        where: { id: proposalId },
        data: {
          [`${oldVote}Votes`]: { decrement: 1 },
          [`${vote}Votes`]: { increment: 1 },
        },
      }),
    ]);
  } else {
    // New vote
    await prisma.$transaction([
      prisma.circleVote.create({
        data: { proposalId, userId, vote, comment },
      }),
      prisma.circleProposal.update({
        where: { id: proposalId },
        data: {
          [`${vote}Votes`]: { increment: 1 },
        },
      }),
    ]);

    await createCircleActivity(proposal.circleId, 'vote_cast', userId, {
      proposalId,
      proposalTitle: proposal.title,
      voterName: voter?.name,
    });
  }

  return prisma.circleProposal.findUnique({
    where: { id: proposalId },
    include: { _count: { select: { votes: true } } },
  });
}

// Get user's vote on a proposal
export async function getUserVote(proposalId: string, userId: string) {
  return prisma.circleVote.findUnique({
    where: { proposalId_userId: { proposalId, userId } },
  });
}

// Check if proposal should be resolved
export async function checkProposalResolution(proposalId: string) {
  const proposal = await prisma.circleProposal.findUnique({
    where: { id: proposalId },
    include: {
      circle: {
        select: {
          votingThreshold: true,
          pooledBalance: true,
          _count: { select: { members: { where: { status: 'active' } } } },
        },
      },
    },
  });

  if (!proposal || proposal.status !== 'voting') {
    return null;
  }

  const now = new Date();
  if (proposal.votingEnds > now) {
    return { status: 'voting', proposal };
  }

  // Voting has ended - calculate result
  const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const totalMembers = proposal.circle._count.members;

  // Need at least majority participation
  const participationRate = totalVotes / totalMembers;
  if (participationRate < 0.5) {
    return { status: 'expired', proposal };
  }

  // Calculate approval rate (abstains don't count)
  const votingMembers = proposal.yesVotes + proposal.noVotes;
  const approvalRate = votingMembers > 0 ? proposal.yesVotes / votingMembers : 0;

  if (approvalRate >= proposal.circle.votingThreshold) {
    // Check if still have funds
    if (proposal.amount <= proposal.circle.pooledBalance) {
      return { status: 'approved', proposal };
    }
    return { status: 'insufficient_funds', proposal };
  }

  return { status: 'rejected', proposal };
}

// Resolve proposal (called by cron or after voting ends)
export async function resolveProposal(proposalId: string) {
  const result = await checkProposalResolution(proposalId);

  if (!result || result.status === 'voting') {
    return null;
  }

  const { status, proposal } = result;

  if (status === 'approved') {
    return executeProposal(proposalId);
  }

  // Update status for rejected/expired
  const newStatus = status === 'expired' ? 'expired' : 'rejected';

  await prisma.circleProposal.update({
    where: { id: proposalId },
    data: { status: newStatus },
  });

  const activityType = status === 'expired' ? 'proposal_expired' : 'proposal_rejected';
  await createCircleActivity(proposal.circleId, activityType, null, {
    proposalId,
    title: proposal.title,
    yesVotes: proposal.yesVotes,
    noVotes: proposal.noVotes,
    abstainVotes: proposal.abstainVotes,
  });

  return { status: newStatus };
}

// Execute approved proposal (fund the project/loan)
async function executeProposal(proposalId: string) {
  const proposal = await prisma.circleProposal.findUnique({
    where: { id: proposalId },
    include: {
      circle: { select: { id: true, pooledBalance: true } },
    },
  });

  if (!proposal || proposal.status !== 'voting') {
    throw new Error('Proposal not in voting status');
  }

  if (proposal.amount > proposal.circle.pooledBalance) {
    throw new Error('Insufficient pool balance');
  }

  // Update circle balance and proposal status
  await prisma.$transaction([
    prisma.circleProposal.update({
      where: { id: proposalId },
      data: { status: 'funded', fundedAt: new Date() },
    }),
    prisma.givingCircle.update({
      where: { id: proposal.circleId },
      data: {
        pooledBalance: { decrement: proposal.amount },
        totalDeployed: { increment: proposal.amount },
      },
    }),
  ]);

  // Execute the actual funding based on type
  if (proposal.type === 'project' && proposal.projectId) {
    await prisma.project.update({
      where: { id: proposal.projectId },
      data: { fundingRaised: { increment: proposal.amount } },
    });

    // Create allocation record (no source field - just userId, projectId, amount)
    await prisma.allocation.create({
      data: {
        userId: proposal.proposerId,
        projectId: proposal.projectId,
        amount: proposal.amount,
      },
    });
  } else if (proposal.type === 'loan' && proposal.loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: proposal.loanId },
      select: { sharesRemaining: true, amount: true },
    });

    if (loan) {
      // Calculate shares and amount (each share is $0.25)
      const SHARE_PRICE = 0.25;
      const maxFundable = loan.sharesRemaining * SHARE_PRICE;
      const actualAmount = Math.min(proposal.amount, maxFundable);
      const sharesToFund = Math.floor(actualAmount / SHARE_PRICE);

      if (sharesToFund > 0) {
        await prisma.loan.update({
          where: { id: proposal.loanId },
          data: { sharesRemaining: { decrement: sharesToFund } },
        });

        // Create loan share (uses 'count' not 'shares')
        await prisma.loanShare.create({
          data: {
            loanId: proposal.loanId,
            funderId: proposal.proposerId,
            amount: sharesToFund * SHARE_PRICE,
            count: sharesToFund,
          },
        });
      }
    }
  }

  await createCircleActivity(proposal.circleId, 'proposal_funded', null, {
    proposalId,
    title: proposal.title,
    amount: proposal.amount,
    type: proposal.type,
    projectId: proposal.projectId,
    loanId: proposal.loanId,
  });

  return { status: 'funded', amount: proposal.amount };
}

// Get voting progress
export function getVotingProgress(proposal: {
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  votingEnds: Date;
  circle?: { votingThreshold: number; _count?: { members: number } };
}) {
  const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const votingMembers = proposal.yesVotes + proposal.noVotes;
  const approvalRate = votingMembers > 0 ? proposal.yesVotes / votingMembers : 0;

  const threshold = proposal.circle?.votingThreshold || 0.5;
  const memberCount = proposal.circle?._count?.members || 0;
  const participationRate = memberCount > 0 ? totalVotes / memberCount : 0;

  const now = new Date();
  const timeRemaining = Math.max(0, proposal.votingEnds.getTime() - now.getTime());
  const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));

  return {
    yesVotes: proposal.yesVotes,
    noVotes: proposal.noVotes,
    abstainVotes: proposal.abstainVotes,
    totalVotes,
    approvalRate,
    threshold,
    participationRate,
    meetsThreshold: approvalRate >= threshold,
    daysRemaining,
    isActive: timeRemaining > 0,
  };
}
