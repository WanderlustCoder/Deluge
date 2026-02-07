import { prisma } from './prisma';
import { createCircleActivity } from './circle-activity';

// Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

// Create a new giving circle
export async function createCircle(
  userId: string,
  data: {
    name: string;
    description?: string;
    imageUrl?: string;
    isPrivate?: boolean;
    memberLimit?: number;
    minContribution?: number;
    votingThreshold?: number;
    votingPeriod?: number;
    focusCategories?: string[];
    focusCommunities?: string[];
  }
) {
  let slug = generateSlug(data.name);

  // Ensure unique slug
  let counter = 0;
  let uniqueSlug = slug;
  while (await prisma.givingCircle.findUnique({ where: { slug: uniqueSlug } })) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  const circle = await prisma.givingCircle.create({
    data: {
      name: data.name,
      slug: uniqueSlug,
      description: data.description,
      imageUrl: data.imageUrl,
      isPrivate: data.isPrivate ?? false,
      memberLimit: data.memberLimit,
      minContribution: data.minContribution,
      votingThreshold: data.votingThreshold ?? 0.5,
      votingPeriod: data.votingPeriod ?? 7,
      focusCategories: data.focusCategories ? JSON.stringify(data.focusCategories) : null,
      focusCommunities: data.focusCommunities ? JSON.stringify(data.focusCommunities) : null,
      members: {
        create: {
          userId,
          role: 'founder',
          status: 'active',
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });

  // Log activity
  await createCircleActivity(circle.id, 'member_joined', userId, {
    role: 'founder',
    name: circle.members[0].user.name,
  });

  return circle;
}

// Get circle by slug
export async function getCircleBySlug(slug: string) {
  return prisma.givingCircle.findUnique({
    where: { slug },
    include: {
      members: {
        where: { status: 'active' },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: [
          { role: 'asc' }, // founder, admin, member
          { totalContributed: 'desc' },
        ],
      },
      _count: {
        select: {
          proposals: { where: { status: 'voting' } },
          contributions: true,
        },
      },
    },
  });
}

// List circles
export async function listCircles(options?: {
  status?: string;
  isPrivate?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.status) {
    where.status = options.status;
  } else {
    where.status = 'active';
  }

  if (options?.isPrivate !== undefined) {
    where.isPrivate = options.isPrivate;
  }

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
    ];
  }

  const [circles, total] = await Promise.all([
    prisma.givingCircle.findMany({
      where,
      include: {
        members: {
          where: { status: 'active' },
          take: 5,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { members: { where: { status: 'active' } } },
        },
      },
      orderBy: { totalDeployed: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    }),
    prisma.givingCircle.count({ where }),
  ]);

  return { circles, total };
}

// Get user's circles
export async function getUserCircles(userId: string) {
  const memberships = await prisma.circleMember.findMany({
    where: { userId, status: 'active' },
    include: {
      circle: {
        include: {
          _count: {
            select: {
              members: { where: { status: 'active' } },
              proposals: { where: { status: 'voting' } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  return memberships.map((m) => ({
    ...m.circle,
    role: m.role,
    memberTotalContributed: m.totalContributed,
  }));
}

// Update circle
export async function updateCircle(
  circleId: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    isPrivate?: boolean;
    memberLimit?: number;
    minContribution?: number;
    votingThreshold?: number;
    votingPeriod?: number;
    focusCategories?: string[];
    focusCommunities?: string[];
    status?: string;
  }
) {
  return prisma.givingCircle.update({
    where: { id: circleId },
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      isPrivate: data.isPrivate,
      memberLimit: data.memberLimit,
      minContribution: data.minContribution,
      votingThreshold: data.votingThreshold,
      votingPeriod: data.votingPeriod,
      focusCategories: data.focusCategories ? JSON.stringify(data.focusCategories) : undefined,
      focusCommunities: data.focusCommunities ? JSON.stringify(data.focusCommunities) : undefined,
      status: data.status,
    },
  });
}

// Check if user is member
export async function isCircleMember(circleId: string, userId: string) {
  const member = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId } },
  });
  return member?.status === 'active';
}

// Check if user is admin/founder
export async function isCircleAdmin(circleId: string, userId: string) {
  const member = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId } },
  });
  return member?.status === 'active' && (member.role === 'admin' || member.role === 'founder');
}

// Join circle (for public circles)
export async function joinCircle(circleId: string, userId: string) {
  const circle = await prisma.givingCircle.findUnique({
    where: { id: circleId },
    include: { _count: { select: { members: { where: { status: 'active' } } } } },
  });

  if (!circle) {
    throw new Error('Circle not found');
  }

  if (circle.isPrivate) {
    throw new Error('This circle requires an invitation');
  }

  if (circle.memberLimit && circle._count.members >= circle.memberLimit) {
    throw new Error('Circle is at capacity');
  }

  // Check if already a member
  const existing = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId } },
  });

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('Already a member');
    }
    // Reactivate
    await prisma.circleMember.update({
      where: { id: existing.id },
      data: { status: 'active', joinedAt: new Date() },
    });
  } else {
    await prisma.circleMember.create({
      data: { circleId, userId, role: 'member', status: 'active' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  await createCircleActivity(circleId, 'member_joined', userId, {
    name: user?.name || 'Unknown',
  });

  return true;
}

// Leave circle
export async function leaveCircle(circleId: string, userId: string) {
  const member = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId } },
    include: { user: { select: { name: true } } },
  });

  if (!member || member.status !== 'active') {
    throw new Error('Not a member');
  }

  if (member.role === 'founder') {
    // Check if there are other admins
    const otherAdmins = await prisma.circleMember.count({
      where: {
        circleId,
        status: 'active',
        role: { in: ['admin', 'founder'] },
        userId: { not: userId },
      },
    });

    if (otherAdmins === 0) {
      throw new Error('Founder cannot leave without promoting another admin');
    }
  }

  await prisma.circleMember.update({
    where: { id: member.id },
    data: { status: 'left' },
  });

  await createCircleActivity(circleId, 'member_left', userId, {
    name: member.user.name,
  });

  return true;
}

// Update member role
export async function updateMemberRole(
  circleId: string,
  targetUserId: string,
  newRole: 'admin' | 'member'
) {
  const member = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId: targetUserId } },
  });

  if (!member || member.status !== 'active') {
    throw new Error('Member not found');
  }

  if (member.role === 'founder') {
    throw new Error('Cannot change founder role');
  }

  return prisma.circleMember.update({
    where: { id: member.id },
    data: { role: newRole },
  });
}

// Get circle stats
export async function getCircleStats(circleId: string) {
  const [circle, recentContributions, activeProposals] = await Promise.all([
    prisma.givingCircle.findUnique({
      where: { id: circleId },
      include: {
        _count: {
          select: {
            members: { where: { status: 'active' } },
            contributions: true,
            proposals: true,
          },
        },
      },
    }),
    prisma.circleContribution.aggregate({
      where: {
        circleId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.circleProposal.count({
      where: { circleId, status: 'voting' },
    }),
  ]);

  if (!circle) return null;

  return {
    pooledBalance: circle.pooledBalance,
    totalContributed: circle.totalContributed,
    totalDeployed: circle.totalDeployed,
    memberCount: circle._count.members,
    contributionCount: circle._count.contributions,
    proposalCount: circle._count.proposals,
    monthlyContributions: recentContributions._sum.amount || 0,
    monthlyContributors: recentContributions._count,
    activeProposals,
  };
}

// Contribute to circle pool
export async function contributeToCircle(
  circleId: string,
  userId: string,
  amount: number,
  note?: string
) {
  // Verify membership
  const member = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId } },
    include: { user: { select: { name: true } } },
  });

  if (!member || member.status !== 'active') {
    throw new Error('Not a member of this circle');
  }

  // Check user has funds in watershed
  const watershed = await prisma.watershed.findUnique({
    where: { userId },
  });

  if (!watershed || watershed.balance < amount) {
    throw new Error('Insufficient watershed balance');
  }

  // Perform contribution
  const [contribution] = await prisma.$transaction([
    prisma.circleContribution.create({
      data: { circleId, userId, amount, note },
    }),
    prisma.givingCircle.update({
      where: { id: circleId },
      data: {
        pooledBalance: { increment: amount },
        totalContributed: { increment: amount },
      },
    }),
    prisma.circleMember.update({
      where: { id: member.id },
      data: { totalContributed: { increment: amount } },
    }),
    prisma.watershed.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        type: 'circle_contribution',
        amount: -amount,
        description: `Contribution to giving circle`,
        balanceAfter: watershed.balance - amount,
      },
    }),
  ]);

  await createCircleActivity(circleId, 'contribution', userId, {
    amount,
    name: member.user.name,
  });

  return contribution;
}

// Get contribution history
export async function getContributionHistory(
  circleId: string,
  options?: { limit?: number; offset?: number }
) {
  return prisma.circleContribution.findMany({
    where: { circleId },
    include: {
      circle: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// Get member contributions breakdown
export async function getMemberContributions(circleId: string) {
  return prisma.circleMember.findMany({
    where: { circleId, status: 'active' },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { totalContributed: 'desc' },
  });
}
