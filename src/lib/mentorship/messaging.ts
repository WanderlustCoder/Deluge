// Mentor-mentee messaging

import { prisma } from '@/lib/prisma';

// Send a message in a mentorship
export async function sendMessage(
  mentorshipId: string,
  senderId: string,
  content: string,
  attachments?: string[]
) {
  // Verify user is part of this mentorship
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: {
      mentor: true,
      mentee: true,
    },
  });

  if (!mentorship) {
    throw new Error('Mentorship not found');
  }

  if (mentorship.mentor.userId !== senderId && mentorship.mentee.userId !== senderId) {
    throw new Error('Unauthorized');
  }

  return prisma.mentorMessage.create({
    data: {
      mentorshipId,
      senderId,
      content,
      attachments: attachments ? JSON.stringify(attachments) : null,
    },
  });
}

// Get messages for a mentorship
export async function getMessages(
  mentorshipId: string,
  userId: string,
  options?: {
    before?: Date;
    limit?: number;
  }
) {
  const { before, limit = 50 } = options || {};

  // Verify user is part of this mentorship
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: {
      mentor: true,
      mentee: true,
    },
  });

  if (!mentorship) {
    throw new Error('Mentorship not found');
  }

  if (mentorship.mentor.userId !== userId && mentorship.mentee.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const messages = await prisma.mentorMessage.findMany({
    where: {
      mentorshipId,
      ...(before ? { createdAt: { lt: before } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Mark unread messages as read
  await prisma.mentorMessage.updateMany({
    where: {
      mentorshipId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  // Return in chronological order for display
  return messages.reverse();
}

// Get unread message count for a user
export async function getUnreadCount(userId: string) {
  // Get all mentorships where user is participant
  const [asMentor, asMentee] = await Promise.all([
    prisma.mentor.findUnique({
      where: { userId },
      include: {
        mentorships: {
          where: { status: 'active' },
          select: { id: true },
        },
      },
    }),
    prisma.mentee.findUnique({
      where: { userId },
      include: {
        mentorships: {
          where: { status: 'active' },
          select: { id: true },
        },
      },
    }),
  ]);

  const mentorshipIds = [
    ...(asMentor?.mentorships.map(m => m.id) || []),
    ...(asMentee?.mentorships.map(m => m.id) || []),
  ];

  if (mentorshipIds.length === 0) return 0;

  return prisma.mentorMessage.count({
    where: {
      mentorshipId: { in: mentorshipIds },
      senderId: { not: userId },
      readAt: null,
    },
  });
}

// Get conversation previews (inbox)
export async function getConversationPreviews(userId: string) {
  // Get all active mentorships
  const [mentorProfile, menteeProfile] = await Promise.all([
    prisma.mentor.findUnique({
      where: { userId },
      include: {
        mentorships: {
          where: { status: 'active' },
          include: {
            mentee: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.mentee.findUnique({
      where: { userId },
      include: {
        mentorships: {
          where: { status: 'active' },
          include: {
            mentor: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  const conversations = [];

  // Add mentor conversations (as mentor)
  if (mentorProfile) {
    for (const ship of mentorProfile.mentorships) {
      const lastMessage = ship.messages[0];
      const unreadCount = await prisma.mentorMessage.count({
        where: {
          mentorshipId: ship.id,
          senderId: { not: userId },
          readAt: null,
        },
      });

      conversations.push({
        mentorshipId: ship.id,
        role: 'mentor' as const,
        partner: {
          id: ship.mentee.user.id,
          name: ship.mentee.user.name,
          avatarUrl: ship.mentee.user.avatarUrl,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content.substring(0, 100),
              sentAt: lastMessage.createdAt,
              isOwn: lastMessage.senderId === userId,
            }
          : null,
        unreadCount,
      });
    }
  }

  // Add mentee conversations (as mentee)
  if (menteeProfile) {
    for (const ship of menteeProfile.mentorships) {
      const lastMessage = ship.messages[0];
      const unreadCount = await prisma.mentorMessage.count({
        where: {
          mentorshipId: ship.id,
          senderId: { not: userId },
          readAt: null,
        },
      });

      conversations.push({
        mentorshipId: ship.id,
        role: 'mentee' as const,
        partner: {
          id: ship.mentor.user.id,
          name: ship.mentor.user.name,
          avatarUrl: ship.mentor.user.avatarUrl,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content.substring(0, 100),
              sentAt: lastMessage.createdAt,
              isOwn: lastMessage.senderId === userId,
            }
          : null,
        unreadCount,
      });
    }
  }

  // Sort by most recent message
  return conversations.sort((a, b) => {
    const aTime = a.lastMessage?.sentAt.getTime() || 0;
    const bTime = b.lastMessage?.sentAt.getTime() || 0;
    return bTime - aTime;
  });
}
