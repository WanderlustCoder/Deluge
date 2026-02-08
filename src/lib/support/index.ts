// Support groups management

import { prisma } from '@/lib/prisma';

export type SupportGroupType = 'new_givers' | 'loan_funders' | 'community_leaders' | 'budgeting' | 'general';
export type GroupStatus = 'forming' | 'active' | 'full' | 'archived';

export interface CreateGroupData {
  name: string;
  description: string;
  type: SupportGroupType;
  maxMembers?: number;
  isPrivate?: boolean;
  meetingSchedule?: string;
  timezone?: string;
}

// Create a support group
export async function createSupportGroup(facilitatorId: string, data: CreateGroupData) {
  // Create group and add facilitator as member
  return prisma.$transaction(async (tx) => {
    const group = await tx.supportGroup.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        facilitatorId,
        maxMembers: data.maxMembers || 12,
        isPrivate: data.isPrivate || false,
        meetingSchedule: data.meetingSchedule,
        timezone: data.timezone,
        status: 'forming',
      },
    });

    // Add facilitator as member
    await tx.supportGroupMember.create({
      data: {
        groupId: group.id,
        userId: facilitatorId,
        role: 'facilitator',
      },
    });

    return group;
  });
}

// List support groups
export async function listSupportGroups(options?: {
  type?: SupportGroupType;
  status?: GroupStatus;
  search?: string;
  includePrivate?: boolean;
  page?: number;
  limit?: number;
}) {
  const { type, status, search, includePrivate = false, page = 1, limit = 12 } = options || {};

  const where: Record<string, unknown> = {};

  if (type) where.type = type;
  if (status) where.status = status;
  if (!includePrivate) where.isPrivate = false;

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Exclude archived by default
  if (!status) {
    where.status = { not: 'archived' };
  }

  const [groups, total] = await Promise.all([
    prisma.supportGroup.findMany({
      where,
      include: {
        members: {
          take: 5,
          include: {
            // No user relation on SupportGroupMember, just get member info
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportGroup.count({ where }),
  ]);

  return { groups, total, page, limit };
}

// Get group details
export async function getSupportGroup(groupId: string) {
  return prisma.supportGroup.findUnique({
    where: { id: groupId },
    include: {
      members: true,
      meetings: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      },
      posts: {
        where: { isPinned: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { members: true, posts: true },
      },
    },
  });
}

// Join a support group
export async function joinSupportGroup(groupId: string, userId: string) {
  // Check if group exists and has space
  const group = await prisma.supportGroup.findUnique({
    where: { id: groupId },
    include: {
      _count: { select: { members: true } },
    },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.status === 'full' || group._count.members >= group.maxMembers) {
    throw new Error('This group is full');
  }

  if (group.status === 'archived') {
    throw new Error('This group is no longer active');
  }

  // Check if already a member
  const existing = await prisma.supportGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId },
    },
  });

  if (existing) {
    throw new Error('You are already a member of this group');
  }

  const member = await prisma.supportGroupMember.create({
    data: {
      groupId,
      userId,
      role: 'member',
    },
  });

  // Update group status if now full
  const newCount = group._count.members + 1;
  if (newCount >= group.maxMembers) {
    await prisma.supportGroup.update({
      where: { id: groupId },
      data: { status: 'full' },
    });
  } else if (group.status === 'forming' && newCount >= 3) {
    // Activate group when it has at least 3 members
    await prisma.supportGroup.update({
      where: { id: groupId },
      data: { status: 'active' },
    });
  }

  return member;
}

// Leave a support group
export async function leaveSupportGroup(groupId: string, userId: string) {
  const member = await prisma.supportGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId },
    },
  });

  if (!member) {
    throw new Error('You are not a member of this group');
  }

  // Facilitators cannot leave unless they transfer facilitation
  if (member.role === 'facilitator') {
    throw new Error('Facilitators must transfer facilitation before leaving');
  }

  await prisma.supportGroupMember.delete({
    where: { id: member.id },
  });

  // Update group status if it was full
  const group = await prisma.supportGroup.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });

  if (group && group.status === 'full') {
    await prisma.supportGroup.update({
      where: { id: groupId },
      data: { status: 'active' },
    });
  }
}

// Schedule a group meeting
export async function scheduleMeeting(
  groupId: string,
  facilitatorId: string,
  data: {
    title?: string;
    scheduledAt: Date;
    duration?: number;
    topic?: string;
  }
) {
  // Verify facilitator
  const group = await prisma.supportGroup.findUnique({
    where: { id: groupId },
  });

  if (!group || group.facilitatorId !== facilitatorId) {
    throw new Error('Only the facilitator can schedule meetings');
  }

  return prisma.supportGroupMeeting.create({
    data: {
      groupId,
      title: data.title,
      scheduledAt: data.scheduledAt,
      duration: data.duration || 60,
      topic: data.topic,
    },
  });
}

// Create a post in the group
export async function createGroupPost(groupId: string, authorId: string, content: string) {
  // Verify membership
  const member = await prisma.supportGroupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: authorId },
    },
  });

  if (!member) {
    throw new Error('You must be a member to post');
  }

  return prisma.supportGroupPost.create({
    data: {
      groupId,
      authorId,
      content,
    },
  });
}

// Reply to a post
export async function replyToPost(postId: string, authorId: string, content: string) {
  const post = await prisma.supportGroupPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // Verify membership
  const member = await prisma.supportGroupMember.findUnique({
    where: {
      groupId_userId: { groupId: post.groupId, userId: authorId },
    },
  });

  if (!member) {
    throw new Error('You must be a member to reply');
  }

  return prisma.supportGroupReply.create({
    data: {
      postId,
      authorId,
      content,
    },
  });
}

// Get group feed (posts with replies)
export async function getGroupFeed(groupId: string, page = 1, limit = 20) {
  const [posts, total] = await Promise.all([
    prisma.supportGroupPost.findMany({
      where: { groupId },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 3,
        },
        _count: {
          select: { replies: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportGroupPost.count({ where: { groupId } }),
  ]);

  return { posts, total, page, limit };
}

// Get user's groups
export async function getUserGroups(userId: string) {
  const memberships = await prisma.supportGroupMember.findMany({
    where: { userId, status: 'active' },
    include: {
      group: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
  });

  return memberships.map(m => ({
    ...m.group,
    role: m.role,
    joinedAt: m.joinedAt,
    memberCount: m.group._count.members,
  }));
}
