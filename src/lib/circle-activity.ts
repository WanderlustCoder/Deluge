import { prisma } from './prisma';

export type CircleActivityType =
  | 'contribution'
  | 'proposal_created'
  | 'vote_cast'
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'proposal_funded'
  | 'proposal_expired'
  | 'member_joined'
  | 'member_left'
  | 'discussion';

// Create activity entry
export async function createCircleActivity(
  circleId: string,
  type: CircleActivityType,
  actorId: string | null,
  data: Record<string, unknown>
) {
  return prisma.circleActivity.create({
    data: {
      circleId,
      type,
      actorId,
      data: JSON.stringify(data),
    },
  });
}

// Get circle activity feed
export async function getCircleActivity(
  circleId: string,
  options?: { limit?: number; offset?: number; types?: CircleActivityType[] }
) {
  const where: Record<string, unknown> = { circleId };

  if (options?.types && options.types.length > 0) {
    where.type = { in: options.types };
  }

  const activities = await prisma.circleActivity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });

  return activities.map((a) => ({
    ...a,
    data: JSON.parse(a.data),
  }));
}

// Format activity for display
export function formatActivityMessage(
  type: CircleActivityType,
  data: Record<string, unknown>
): string {
  switch (type) {
    case 'contribution':
      return `${data.name || 'A member'} contributed $${(data.amount as number).toFixed(2)} to the pool`;
    case 'proposal_created':
      return `${data.proposerName || 'A member'} proposed: "${data.title}"`;
    case 'vote_cast':
      return `${data.voterName || 'A member'} voted on "${data.proposalTitle}"`;
    case 'proposal_approved':
      return `Proposal "${data.title}" was approved by the circle`;
    case 'proposal_rejected':
      return `Proposal "${data.title}" did not reach approval threshold`;
    case 'proposal_funded':
      return `$${(data.amount as number).toFixed(2)} deployed to "${data.projectTitle || data.title}"`;
    case 'proposal_expired':
      return `Proposal "${data.title}" expired without enough votes`;
    case 'member_joined':
      return `${data.name || 'A new member'} joined the circle`;
    case 'member_left':
      return `${data.name || 'A member'} left the circle`;
    case 'discussion':
      return `${data.authorName || 'A member'} started a discussion`;
    default:
      return 'Activity in the circle';
  }
}

// Aggregate activity for digest
export async function getActivitySummary(
  circleId: string,
  since: Date
): Promise<{
  contributions: number;
  contributionTotal: number;
  proposalsCreated: number;
  proposalsFunded: number;
  membersJoined: number;
  votescast: number;
}> {
  const activities = await prisma.circleActivity.findMany({
    where: {
      circleId,
      createdAt: { gte: since },
    },
  });

  let contributions = 0;
  let contributionTotal = 0;
  let proposalsCreated = 0;
  let proposalsFunded = 0;
  let membersJoined = 0;
  let votescast = 0;

  for (const activity of activities) {
    const data = JSON.parse(activity.data);
    switch (activity.type) {
      case 'contribution':
        contributions++;
        contributionTotal += data.amount || 0;
        break;
      case 'proposal_created':
        proposalsCreated++;
        break;
      case 'proposal_funded':
        proposalsFunded++;
        break;
      case 'member_joined':
        membersJoined++;
        break;
      case 'vote_cast':
        votescast++;
        break;
    }
  }

  return {
    contributions,
    contributionTotal,
    proposalsCreated,
    proposalsFunded,
    membersJoined,
    votescast,
  };
}
