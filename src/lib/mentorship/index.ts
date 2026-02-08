// Mentorship management

import { prisma } from '@/lib/prisma';

export type MentorExpertise = 'giving' | 'loans' | 'community' | 'financial' | 'budgeting';
export type MentorStyle = 'async' | 'scheduled' | 'casual' | 'any';
export type MentorStatus = 'pending' | 'active' | 'paused' | 'retired';
export type MenteeStatus = 'seeking' | 'matched' | 'completed';
export type MentorshipStatus = 'pending' | 'active' | 'paused' | 'completed' | 'ended';

export interface MentorApplicationData {
  bio: string;
  expertise: MentorExpertise[];
  availability: string;
  maxMentees?: number;
  preferredStyle: MentorStyle;
  languages?: string[];
  timezone?: string;
}

export interface MenteeProfileData {
  goals: string[];
  challenges?: string;
  preferredStyle?: MentorStyle;
  timezone?: string;
}

// Apply to become a mentor
export async function applyToBecomeMentor(userId: string, data: MentorApplicationData) {
  // Check if user already has a mentor profile
  const existing = await prisma.mentor.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error('You already have a mentor profile');
  }

  return prisma.mentor.create({
    data: {
      userId,
      bio: data.bio,
      expertise: JSON.stringify(data.expertise),
      availability: data.availability,
      maxMentees: data.maxMentees || 3,
      preferredStyle: data.preferredStyle,
      languages: JSON.stringify(data.languages || ['en']),
      timezone: data.timezone,
      applicationDate: new Date(),
      status: 'pending',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

// Approve a mentor application
export async function approveMentor(mentorId: string, approvedBy: string) {
  return prisma.mentor.update({
    where: { id: mentorId },
    data: {
      status: 'active',
      approvedDate: new Date(),
      approvedBy,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

// Reject a mentor application
export async function rejectMentor(mentorId: string) {
  return prisma.mentor.delete({
    where: { id: mentorId },
  });
}

// Get mentor by userId
export async function getMentorByUserId(userId: string) {
  return prisma.mentor.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
      mentorships: {
        where: { status: 'active' },
        include: {
          mentee: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      reviews: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

// List active mentors
export async function listActiveMentors(options?: {
  expertise?: MentorExpertise;
  style?: MentorStyle;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { expertise, style, search, page = 1, limit = 12 } = options || {};

  const where: Record<string, unknown> = {
    status: 'active',
    isAccepting: true,
  };

  if (expertise) {
    where.expertise = { contains: expertise };
  }

  if (style && style !== 'any') {
    where.preferredStyle = style;
  }

  if (search) {
    where.OR = [
      { bio: { contains: search } },
      { user: { name: { contains: search } } },
    ];
  }

  const [mentors, total] = await Promise.all([
    prisma.mentor.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { avgRating: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mentor.count({ where }),
  ]);

  return { mentors, total, page, limit };
}

// Create or update mentee profile
export async function createOrUpdateMenteeProfile(userId: string, data: MenteeProfileData) {
  return prisma.mentee.upsert({
    where: { userId },
    create: {
      userId,
      goals: JSON.stringify(data.goals),
      challenges: data.challenges,
      preferredStyle: data.preferredStyle || 'any',
      timezone: data.timezone,
    },
    update: {
      goals: JSON.stringify(data.goals),
      challenges: data.challenges,
      preferredStyle: data.preferredStyle || 'any',
      timezone: data.timezone,
    },
  });
}

// Get mentee profile
export async function getMenteeProfile(userId: string) {
  return prisma.mentee.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
      mentorships: {
        include: {
          mentor: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });
}

// Request a mentor
export async function requestMentor(menteeId: string, mentorId: string, goals: string[]) {
  // Check if mentorship already exists
  const existing = await prisma.mentorship.findUnique({
    where: {
      mentorId_menteeId: {
        mentorId,
        menteeId,
      },
    },
  });

  if (existing) {
    throw new Error('You already have a mentorship request with this mentor');
  }

  // Check if mentor is accepting
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
  });

  if (!mentor || !mentor.isAccepting || mentor.currentMentees >= mentor.maxMentees) {
    throw new Error('This mentor is not currently accepting new mentees');
  }

  return prisma.mentorship.create({
    data: {
      mentorId,
      menteeId,
      goals: JSON.stringify(goals),
      status: 'pending',
    },
    include: {
      mentor: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
      mentee: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });
}

// Accept a mentorship request
export async function acceptMentorship(mentorshipId: string, mentorUserId: string) {
  const mentorship = await prisma.mentorship.findUnique({
    where: { id: mentorshipId },
    include: { mentor: true },
  });

  if (!mentorship || mentorship.mentor.userId !== mentorUserId) {
    throw new Error('Mentorship not found or unauthorized');
  }

  // Update mentorship and mentor counts
  const [updatedMentorship] = await prisma.$transaction([
    prisma.mentorship.update({
      where: { id: mentorshipId },
      data: {
        status: 'active',
        startDate: new Date(),
      },
    }),
    prisma.mentor.update({
      where: { id: mentorship.mentorId },
      data: {
        currentMentees: { increment: 1 },
        totalMentees: { increment: 1 },
      },
    }),
    prisma.mentee.update({
      where: { id: mentorship.menteeId },
      data: { status: 'matched' },
    }),
  ]);

  return updatedMentorship;
}

// End a mentorship
export async function endMentorship(mentorshipId: string, userId: string, completionNotes?: string) {
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

  // Check authorization
  if (mentorship.mentor.userId !== userId && mentorship.mentee.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const [updated] = await prisma.$transaction([
    prisma.mentorship.update({
      where: { id: mentorshipId },
      data: {
        status: 'completed',
        endDate: new Date(),
        completionNotes,
      },
    }),
    prisma.mentor.update({
      where: { id: mentorship.mentorId },
      data: {
        currentMentees: { decrement: 1 },
      },
    }),
    prisma.mentee.update({
      where: { id: mentorship.menteeId },
      data: { status: 'completed' },
    }),
  ]);

  return updated;
}

// Get user's mentorships
export async function getUserMentorships(userId: string) {
  // Get mentorships as mentor
  const asMentor = await prisma.mentorship.findMany({
    where: {
      mentor: { userId },
    },
    include: {
      mentee: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      menteeGoals: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get mentorships as mentee
  const asMentee = await prisma.mentorship.findMany({
    where: {
      mentee: { userId },
    },
    include: {
      mentor: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      menteeGoals: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { asMentor, asMentee };
}

// Get pending mentor applications (admin)
export async function getPendingMentorApplications() {
  return prisma.mentor.findMany({
    where: { status: 'pending' },
    include: {
      user: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
    orderBy: { applicationDate: 'asc' },
  });
}
