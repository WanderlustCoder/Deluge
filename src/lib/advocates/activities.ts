import { prisma } from '@/lib/prisma';

export type ActivityType = 'welcome' | 'event' | 'content' | 'support' | 'outreach';

export const ACTIVITY_TYPES: { value: ActivityType; label: string; description: string }[] = [
  { value: 'welcome', label: 'Welcomed Someone', description: 'Helped onboard new community members' },
  { value: 'event', label: 'Hosted Event', description: 'Organized or hosted a gathering' },
  { value: 'content', label: 'Created Content', description: 'Created helpful resources' },
  { value: 'support', label: 'Provided Support', description: 'Answered questions, helped troubleshoot' },
  { value: 'outreach', label: 'Outreach', description: 'Represented Deluge at external events' },
];

// Log an activity (trust advocates to log their contributions)
export async function logActivity(
  advocateId: string,
  data: {
    type: ActivityType;
    description: string;
    communityId?: string;
  }
) {
  // Verify advocate exists and is active
  const advocate = await prisma.communityAdvocate.findUnique({
    where: { id: advocateId },
    select: { status: true },
  });

  if (!advocate || advocate.status !== 'active') {
    throw new Error('Not an active advocate');
  }

  return prisma.advocateActivity.create({
    data: {
      advocateId,
      type: data.type,
      description: data.description,
      communityId: data.communityId,
    },
  });
}

// Get advocate's activity history
export async function getActivityHistory(
  advocateId: string,
  options?: {
    type?: ActivityType;
    limit?: number;
  }
) {
  const { type, limit = 50 } = options || {};

  const where: Record<string, unknown> = { advocateId };
  if (type) where.type = type;

  return prisma.advocateActivity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Get activity summary for an advocate (counts only, not scores)
export async function getActivitySummary(advocateId: string) {
  const activities = await prisma.advocateActivity.findMany({
    where: { advocateId },
    select: { type: true },
  });

  const counts: Record<string, number> = {};
  for (const type of ACTIVITY_TYPES) {
    counts[type.value] = 0;
  }

  for (const activity of activities) {
    counts[activity.type] = (counts[activity.type] || 0) + 1;
  }

  return {
    total: activities.length,
    byType: counts,
  };
}

// Get recent activities across all advocates (for admin)
export async function getRecentActivities(limit = 50) {
  return prisma.advocateActivity.findMany({
    include: {
      advocate: {
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
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
