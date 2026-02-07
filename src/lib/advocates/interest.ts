import { prisma } from '@/lib/prisma';
import { createAdvocate } from './index';

// Express interest in becoming an advocate
export async function expressInterest(
  userId: string,
  data: {
    motivation: string;
    interests?: string[];
    availability?: string;
    region?: string;
  }
) {
  // Check if already an advocate
  const existing = await prisma.communityAdvocate.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error('You are already a community advocate');
  }

  // Check for existing pending interest
  const pendingInterest = await prisma.advocateInterest.findUnique({
    where: { userId },
  });

  if (pendingInterest) {
    // Update existing interest
    return prisma.advocateInterest.update({
      where: { userId },
      data: {
        motivation: data.motivation,
        interests: data.interests?.join(','),
        availability: data.availability,
        region: data.region,
        status: 'pending',
      },
    });
  }

  return prisma.advocateInterest.create({
    data: {
      userId,
      motivation: data.motivation,
      interests: data.interests?.join(','),
      availability: data.availability,
      region: data.region,
    },
  });
}

// Get user's interest status
export async function getInterestStatus(userId: string) {
  return prisma.advocateInterest.findUnique({
    where: { userId },
  });
}

// List pending interests (admin)
export async function listPendingInterests(limit = 50) {
  return prisma.advocateInterest.findMany({
    where: { status: 'pending' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

// Welcome someone as an advocate
export async function welcomeAdvocate(
  interestId: string,
  adminId: string
) {
  const interest = await prisma.advocateInterest.findUnique({
    where: { id: interestId },
    include: { user: true },
  });

  if (!interest) {
    throw new Error('Interest not found');
  }

  if (interest.status !== 'pending') {
    throw new Error('Interest is not pending');
  }

  // Create the advocate profile
  await createAdvocate(interest.userId, {
    region: interest.region || undefined,
    interests: interest.interests?.split(',') || [],
  });

  // Update the interest record
  await prisma.advocateInterest.update({
    where: { id: interestId },
    data: {
      status: 'welcomed',
      welcomedBy: adminId,
      welcomedAt: new Date(),
    },
  });

  return { userId: interest.userId, name: interest.user.name };
}

// Decline an interest (with kindness)
export async function declineInterest(interestId: string) {
  return prisma.advocateInterest.update({
    where: { id: interestId },
    data: { status: 'declined' },
  });
}
