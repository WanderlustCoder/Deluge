import { prisma } from '@/lib/prisma';

export interface CreateCommentInput {
  campaignId: string;
  userId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

// Create a comment
export async function createComment(input: CreateCommentInput) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id: input.campaignId },
    select: { creatorId: true, status: true },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Validate parent comment if replying
  if (input.parentId) {
    const parentComment = await prisma.campaignComment.findFirst({
      where: {
        id: input.parentId,
        campaignId: input.campaignId,
      },
    });

    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
  }

  const isCreator = campaign.creatorId === input.userId;

  const comment = await prisma.campaignComment.create({
    data: {
      campaignId: input.campaignId,
      userId: input.userId,
      content: input.content,
      parentId: input.parentId,
      isCreator,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return comment;
}

// Get comment by ID
export async function getCommentById(id: string) {
  const comment = await prisma.campaignComment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      campaign: { select: { id: true, title: true, creatorId: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return comment;
}

// Update a comment
export async function updateComment(id: string, userId: string, input: UpdateCommentInput) {
  const comment = await prisma.campaignComment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new Error('Not authorized to edit this comment');
  }

  // Check if comment is too old to edit (e.g., older than 24 hours)
  const hoursSinceCreation = (Date.now() - comment.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) {
    throw new Error('Cannot edit comments older than 24 hours');
  }

  const updatedComment = await prisma.campaignComment.update({
    where: { id },
    data: {
      content: input.content,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return updatedComment;
}

// Delete a comment
export async function deleteComment(id: string, userId: string, isAdmin: boolean = false) {
  const comment = await prisma.campaignComment.findUnique({
    where: { id },
    include: {
      campaign: { select: { creatorId: true } },
    },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Allow deletion by: comment author, campaign creator, or admin
  const canDelete = comment.userId === userId ||
                    comment.campaign.creatorId === userId ||
                    isAdmin;

  if (!canDelete) {
    throw new Error('Not authorized to delete this comment');
  }

  // Delete comment and all replies
  await prisma.campaignComment.deleteMany({
    where: {
      OR: [
        { id },
        { parentId: id },
      ],
    },
  });

  return true;
}

// Get comments for a campaign
export async function getCampaignComments(
  campaignId: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'oldest';
  }
) {
  const { limit = 50, offset = 0, sortBy = 'newest' } = options || {};

  // Get top-level comments only
  const [comments, total] = await Promise.all([
    prisma.campaignComment.findMany({
      where: {
        campaignId,
        parentId: null,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: sortBy === 'newest' ? 'desc' : 'asc' },
      skip: offset,
      take: limit,
    }),
    prisma.campaignComment.count({
      where: { campaignId, parentId: null },
    }),
  ]);

  return { comments, total };
}

// Get replies to a comment
export async function getCommentReplies(commentId: string, limit: number = 50) {
  const replies = await prisma.campaignComment.findMany({
    where: { parentId: commentId },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return replies;
}

// Get comment count for a campaign
export async function getCommentCount(campaignId: string): Promise<number> {
  const count = await prisma.campaignComment.count({
    where: { campaignId },
  });

  return count;
}

// Get comments by a user
export async function getUserComments(userId: string, limit: number = 20) {
  const comments = await prisma.campaignComment.findMany({
    where: { userId },
    include: {
      campaign: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return comments;
}

// Pin/highlight a comment (for campaign creators)
export async function toggleCreatorHighlight(
  commentId: string,
  campaignCreatorId: string
) {
  const comment = await prisma.campaignComment.findUnique({
    where: { id: commentId },
    include: { campaign: { select: { creatorId: true } } },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.campaign.creatorId !== campaignCreatorId) {
    throw new Error('Only the campaign creator can highlight comments');
  }

  // Note: This would require adding a 'isHighlighted' field to the schema
  // For now, we'll just return the comment
  return comment;
}

// Get total comment stats for a campaign
export async function getCommentStats(campaignId: string) {
  const [totalComments, totalReplies, uniqueCommenters] = await Promise.all([
    prisma.campaignComment.count({
      where: { campaignId, parentId: null },
    }),
    prisma.campaignComment.count({
      where: { campaignId, parentId: { not: null } },
    }),
    prisma.campaignComment.groupBy({
      by: ['userId'],
      where: { campaignId },
    }).then(groups => groups.length),
  ]);

  return {
    totalComments,
    totalReplies,
    total: totalComments + totalReplies,
    uniqueCommenters,
  };
}
