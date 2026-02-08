import { prisma } from '@/lib/prisma';

// Create a shared journey
export async function createJourney(
  creatorId: string,
  data: {
    name: string;
    description: string;
    purpose: string;
    imageUrl?: string;
    targetType?: string;
    targetValue?: number;
    visibility?: string;
  }
) {
  const journey = await prisma.sharedJourney.create({
    data: {
      ...data,
      creatorId,
      members: {
        create: {
          userId: creatorId,
          role: 'creator',
        },
      },
      moments: {
        create: {
          type: 'journey_created',
          message: `${data.name} has begun!`,
        },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return journey;
}

// Join a journey
export async function joinJourney(journeyId: string, userId: string) {
  const existing = await prisma.journeyMember.findUnique({
    where: { journeyId_userId: { journeyId, userId } },
  });

  if (existing) {
    return existing;
  }

  const [member] = await Promise.all([
    prisma.journeyMember.create({
      data: { journeyId, userId, role: 'member' },
    }),
    prisma.journeyMoment.create({
      data: {
        journeyId,
        type: 'member_joined',
        message: 'A new traveler joined the journey!',
      },
    }),
  ]);

  return member;
}

// Leave a journey
export async function leaveJourney(journeyId: string, userId: string) {
  return prisma.journeyMember.delete({
    where: { journeyId_userId: { journeyId, userId } },
  });
}

// Get journey by ID
export async function getJourney(journeyId: string) {
  return prisma.sharedJourney.findUnique({
    where: { id: journeyId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      moments: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
}

// Get user's journeys
export async function getUserJourneys(userId: string) {
  const memberships = await prisma.journeyMember.findMany({
    where: { userId },
    include: {
      journey: {
        include: {
          members: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  return memberships.map((m) => ({
    ...m.journey,
    memberCount: m.journey.members.length,
    myRole: m.role,
  }));
}

// Update journey progress
export async function updateJourneyProgress(
  journeyId: string,
  increment: number
) {
  const journey = await prisma.sharedJourney.update({
    where: { id: journeyId },
    data: { currentValue: { increment } },
  });

  // Check for milestone moments
  if (journey.targetValue) {
    const percentComplete = (journey.currentValue / journey.targetValue) * 100;

    // Add milestone moments at 25%, 50%, 75%, 100%
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      const prevPercent = ((journey.currentValue - increment) / journey.targetValue) * 100;
      if (prevPercent < milestone && percentComplete >= milestone) {
        await prisma.journeyMoment.create({
          data: {
            journeyId,
            type: 'milestone_reached',
            message:
              milestone === 100
                ? 'We did it! Journey complete!'
                : `We're ${milestone}% there!`,
            metadata: JSON.stringify({ milestone }),
          },
        });

        if (milestone === 100) {
          await prisma.sharedJourney.update({
            where: { id: journeyId },
            data: { status: 'completed' },
          });
        }
      }
    }
  }

  return journey;
}

// Add a moment to a journey
export async function addJourneyMoment(
  journeyId: string,
  type: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  return prisma.journeyMoment.create({
    data: {
      journeyId,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

// Get public/community journeys
export async function getPublicJourneys(limit: number = 20) {
  return prisma.sharedJourney.findMany({
    where: { visibility: 'public', status: 'active' },
    include: {
      members: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
