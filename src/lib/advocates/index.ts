import { prisma } from '@/lib/prisma';

export interface AdvocateStats {
  totalActive: number;
  totalEvents: number;
  totalActivities: number;
  regions: string[];
}

// Get advocate by user ID
export async function getAdvocate(userId: string) {
  return prisma.communityAdvocate.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      events: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5,
      },
    },
  });
}

// Get advocate by advocate ID
export async function getAdvocateById(id: string) {
  return prisma.communityAdvocate.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// List all active advocates
export async function listAdvocates(options?: {
  status?: string;
  region?: string;
  limit?: number;
}) {
  const { status = 'active', region, limit = 50 } = options || {};

  const where: Record<string, unknown> = { publicProfile: true };
  if (status) where.status = status;
  if (region) where.region = region;

  return prisma.communityAdvocate.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
    take: limit,
  });
}

// Check if user is an advocate
export async function isAdvocate(userId: string): Promise<boolean> {
  const advocate = await prisma.communityAdvocate.findUnique({
    where: { userId },
    select: { status: true },
  });
  return advocate?.status === 'active';
}

// Create advocate from welcomed interest
export async function createAdvocate(
  userId: string,
  data: {
    region?: string;
    interests?: string[];
    bio?: string;
  }
) {
  // Check for existing advocate
  const existing = await prisma.communityAdvocate.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error('User is already an advocate');
  }

  return prisma.communityAdvocate.create({
    data: {
      userId,
      region: data.region,
      interests: data.interests?.join(','),
      bio: data.bio,
      joinedAt: new Date(),
    },
  });
}

// Update advocate profile
export async function updateAdvocate(
  userId: string,
  data: {
    region?: string;
    interests?: string[];
    bio?: string;
    publicProfile?: boolean;
    status?: string;
  }
) {
  return prisma.communityAdvocate.update({
    where: { userId },
    data: {
      region: data.region,
      interests: data.interests?.join(','),
      bio: data.bio,
      publicProfile: data.publicProfile,
      status: data.status,
    },
  });
}

// Get advocate program stats (aggregate, not individual rankings)
export async function getAdvocateStats(): Promise<AdvocateStats> {
  const [advocates, activities, events] = await Promise.all([
    prisma.communityAdvocate.findMany({
      where: { status: 'active' },
      select: { region: true },
    }),
    prisma.advocateActivity.count(),
    prisma.advocateEvent.count(),
  ]);

  const regions = [...new Set(advocates.map((a) => a.region).filter(Boolean))] as string[];

  return {
    totalActive: advocates.length,
    totalActivities: activities,
    totalEvents: events,
    regions,
  };
}

// Get regions with advocate counts (for coverage map)
export async function getRegionCoverage() {
  const advocates = await prisma.communityAdvocate.findMany({
    where: { status: 'active' },
    select: { region: true },
  });

  const counts: Record<string, number> = {};
  for (const a of advocates) {
    if (a.region) {
      counts[a.region] = (counts[a.region] || 0) + 1;
    }
  }

  return Object.entries(counts).map(([region, count]) => ({ region, count }));
}
