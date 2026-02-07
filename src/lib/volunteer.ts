import { prisma } from './prisma';

// Volunteer opportunity management

export async function createOpportunity(
  projectId: string,
  data: {
    title: string;
    description: string;
    hoursNeeded?: number;
    skillsRequired?: string[];
    location?: string;
    isRemote?: boolean;
    startDate?: Date;
    endDate?: Date;
    maxVolunteers?: number;
  }
) {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return prisma.volunteerOpportunity.create({
    data: {
      projectId,
      title: data.title,
      description: data.description,
      hoursNeeded: data.hoursNeeded,
      skillsRequired: data.skillsRequired ? JSON.stringify(data.skillsRequired) : null,
      location: data.location,
      isRemote: data.isRemote ?? false,
      startDate: data.startDate,
      endDate: data.endDate,
      maxVolunteers: data.maxVolunteers,
    },
  });
}

export async function getOpportunity(id: string) {
  return prisma.volunteerOpportunity.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          imageUrl: true,
        },
      },
      signups: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          signups: true,
          logs: true,
        },
      },
    },
  });
}

export async function listOpportunities(options: {
  status?: string;
  projectId?: string;
  skill?: string;
  isRemote?: boolean;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options.status) {
    where.status = options.status;
  } else {
    where.status = 'open';
  }

  if (options.projectId) {
    where.projectId = options.projectId;
  }

  if (options.isRemote !== undefined) {
    where.isRemote = options.isRemote;
  }

  if (options.skill) {
    where.skillsRequired = { contains: options.skill };
  }

  return prisma.volunteerOpportunity.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          imageUrl: true,
        },
      },
      _count: {
        select: {
          signups: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit || 20,
    skip: options.offset || 0,
  });
}

export async function updateOpportunity(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    hoursNeeded: number;
    skillsRequired: string[];
    location: string;
    isRemote: boolean;
    startDate: Date;
    endDate: Date;
    maxVolunteers: number;
    status: string;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.skillsRequired) {
    updateData.skillsRequired = JSON.stringify(data.skillsRequired);
  }

  return prisma.volunteerOpportunity.update({
    where: { id },
    data: updateData,
  });
}

// Volunteer signup

export async function signUpForOpportunity(
  opportunityId: string,
  userId: string,
  message?: string
) {
  const opportunity = await prisma.volunteerOpportunity.findUnique({
    where: { id: opportunityId },
    include: {
      _count: { select: { signups: true } },
    },
  });

  if (!opportunity) {
    throw new Error('Opportunity not found');
  }

  if (opportunity.status !== 'open') {
    throw new Error('This opportunity is no longer accepting volunteers');
  }

  if (opportunity.maxVolunteers && opportunity._count.signups >= opportunity.maxVolunteers) {
    throw new Error('This opportunity has reached its maximum number of volunteers');
  }

  // Check for existing signup
  const existing = await prisma.volunteerSignup.findUnique({
    where: { opportunityId_userId: { opportunityId, userId } },
  });

  if (existing) {
    if (existing.status === 'cancelled') {
      // Reactivate cancelled signup
      return prisma.volunteerSignup.update({
        where: { id: existing.id },
        data: { status: 'interested', message },
      });
    }
    throw new Error('You have already signed up for this opportunity');
  }

  return prisma.volunteerSignup.create({
    data: {
      opportunityId,
      userId,
      message,
      status: 'interested',
    },
  });
}

export async function updateSignupStatus(
  signupId: string,
  status: string
) {
  return prisma.volunteerSignup.update({
    where: { id: signupId },
    data: { status },
  });
}

export async function cancelSignup(opportunityId: string, userId: string) {
  return prisma.volunteerSignup.update({
    where: { opportunityId_userId: { opportunityId, userId } },
    data: { status: 'cancelled' },
  });
}

export async function getUserSignups(userId: string) {
  return prisma.volunteerSignup.findMany({
    where: { userId, status: { not: 'cancelled' } },
    include: {
      opportunity: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Hour logging

export async function logHours(
  opportunityId: string,
  userId: string,
  hours: number,
  date: Date,
  description?: string
) {
  // Verify user has signed up
  const signup = await prisma.volunteerSignup.findUnique({
    where: { opportunityId_userId: { opportunityId, userId } },
  });

  if (!signup || signup.status === 'cancelled') {
    throw new Error('You must sign up for this opportunity before logging hours');
  }

  const log = await prisma.volunteerLog.create({
    data: {
      opportunityId,
      userId,
      hours,
      date,
      description,
    },
  });

  // Update opportunity hours logged
  await prisma.volunteerOpportunity.update({
    where: { id: opportunityId },
    data: {
      hoursLogged: { increment: hours },
    },
  });

  return log;
}

export async function getUserLogs(userId: string, limit: number = 50) {
  return prisma.volunteerLog.findMany({
    where: { userId },
    include: {
      opportunity: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function verifyHours(
  logId: string,
  verifierId: string,
  approved: boolean,
  adjustedHours?: number
) {
  const log = await prisma.volunteerLog.findUnique({
    where: { id: logId },
  });

  if (!log) {
    throw new Error('Log not found');
  }

  if (log.verified) {
    throw new Error('This log has already been verified');
  }

  // If adjusting hours, update the opportunity total
  const hoursDiff = adjustedHours !== undefined ? adjustedHours - log.hours : 0;

  const updatedLog = await prisma.volunteerLog.update({
    where: { id: logId },
    data: {
      verified: approved,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      hours: adjustedHours ?? log.hours,
    },
  });

  if (hoursDiff !== 0) {
    await prisma.volunteerOpportunity.update({
      where: { id: log.opportunityId },
      data: {
        hoursLogged: { increment: hoursDiff },
      },
    });
  }

  // Update user's verified hours total
  if (approved) {
    await prisma.user.update({
      where: { id: log.userId },
      data: {
        totalVerifiedHours: { increment: adjustedHours ?? log.hours },
      },
    });
  }

  return updatedLog;
}

export async function getPendingVerifications(projectId: string) {
  // Get opportunities for the project
  const opportunities = await prisma.volunteerOpportunity.findMany({
    where: { projectId },
    select: { id: true },
  });

  const opportunityIds = opportunities.map((o) => o.id);

  return prisma.volunteerLog.findMany({
    where: {
      opportunityId: { in: opportunityIds },
      verified: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

// Stats

export async function getUserVolunteerStats(userId: string) {
  const [logs, activeSignups, completedOpportunities] = await Promise.all([
    prisma.volunteerLog.findMany({
      where: { userId },
      select: {
        hours: true,
        verified: true,
        date: true,
      },
    }),
    prisma.volunteerSignup.count({
      where: { userId, status: { not: 'cancelled' } },
    }),
    prisma.volunteerSignup.count({
      where: { userId, status: 'completed' },
    }),
  ]);

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
  const verifiedHours = logs
    .filter((log) => log.verified)
    .reduce((sum, log) => sum + log.hours, 0);
  const pendingHours = logs
    .filter((log) => !log.verified)
    .reduce((sum, log) => sum + log.hours, 0);

  return {
    totalHours,
    verifiedHours,
    pendingHours,
    opportunitiesCompleted: completedOpportunities,
    activeSignups,
  };
}

export async function getCommunityVolunteerStats(communityId: string) {
  // Get projects in this community
  const communityProjects = await prisma.communityProject.findMany({
    where: { communityId },
    select: { projectId: true },
  });

  const projectIds = communityProjects.map((cp) => cp.projectId);

  // Get opportunities for these projects
  const opportunities = await prisma.volunteerOpportunity.findMany({
    where: { projectId: { in: projectIds } },
    select: { id: true, hoursLogged: true },
  });

  const opportunityIds = opportunities.map((o) => o.id);

  const [totalLogs, uniqueVolunteers] = await Promise.all([
    prisma.volunteerLog.aggregate({
      where: { opportunityId: { in: opportunityIds } },
      _sum: { hours: true },
      _count: true,
    }),
    prisma.volunteerLog.findMany({
      where: { opportunityId: { in: opportunityIds } },
      select: { userId: true },
      distinct: ['userId'],
    }),
  ]);

  return {
    totalHours: totalLogs._sum.hours || 0,
    logsCount: totalLogs._count || 0,
    uniqueVolunteers: uniqueVolunteers.length,
    opportunitiesCount: opportunities.length,
  };
}

// Parse skills from JSON string
export function parseSkills(skillsJson: string | null): string[] {
  if (!skillsJson) return [];
  try {
    return JSON.parse(skillsJson);
  } catch {
    return [];
  }
}
