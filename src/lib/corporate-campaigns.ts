import { prisma } from './prisma';

// Create a corporate campaign
export async function createCampaign(
  corporateAccountId: string,
  data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    targetAmount?: number;
    matchingBonus?: number;
    featuredProjects?: string[];
    categories?: string[];
  }
) {
  return prisma.corporateCampaign.create({
    data: {
      corporateAccountId,
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      targetAmount: data.targetAmount,
      matchingBonus: data.matchingBonus,
      featuredProjects: data.featuredProjects ? JSON.stringify(data.featuredProjects) : null,
      categories: data.categories ? JSON.stringify(data.categories) : null,
      status: 'draft',
    },
  });
}

// Get campaign by ID
export async function getCampaign(id: string) {
  return prisma.corporateCampaign.findUnique({
    where: { id },
    include: {
      corporateAccount: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

// Update campaign
export async function updateCampaign(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    targetAmount: number;
    matchingBonus: number;
    featuredProjects: string[];
    categories: string[];
    status: string;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.featuredProjects) {
    updateData.featuredProjects = JSON.stringify(data.featuredProjects);
  }

  if (data.categories) {
    updateData.categories = JSON.stringify(data.categories);
  }

  return prisma.corporateCampaign.update({
    where: { id },
    data: updateData,
  });
}

// List campaigns for a corporate account
export async function listCampaigns(
  corporateAccountId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: Record<string, unknown> = { corporateAccountId };

  if (options?.status) {
    where.status = options.status;
  }

  return prisma.corporateCampaign.findMany({
    where,
    orderBy: { startDate: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// Get active campaigns for a corporate account
export async function getActiveCampaigns(corporateAccountId: string) {
  const now = new Date();
  return prisma.corporateCampaign.findMany({
    where: {
      corporateAccountId,
      status: 'active',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { endDate: 'asc' },
  });
}

// Launch campaign (change status from draft to active)
export async function launchCampaign(id: string) {
  return prisma.corporateCampaign.update({
    where: { id },
    data: { status: 'active' },
  });
}

// Complete campaign
export async function completeCampaign(id: string) {
  return prisma.corporateCampaign.update({
    where: { id },
    data: { status: 'completed' },
  });
}

// Get campaign progress
export async function getCampaignProgress(id: string) {
  const campaign = await prisma.corporateCampaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const progress = campaign.targetAmount
    ? Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)
    : 0;

  const now = new Date();
  const totalDays = (campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (now.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, Math.ceil((campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    campaign,
    currentAmount: campaign.currentAmount,
    targetAmount: campaign.targetAmount,
    progress,
    daysRemaining,
    totalDays: Math.ceil(totalDays),
    elapsedDays: Math.max(0, Math.floor(elapsedDays)),
    isActive: campaign.status === 'active' && now >= campaign.startDate && now <= campaign.endDate,
  };
}

// Get campaign leaderboard (by department)
export async function getCampaignLeaderboard(campaignId: string) {
  const campaign = await prisma.corporateCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Get matching records during campaign period
  const records = await prisma.corporateMatchingRecord.findMany({
    where: {
      corporateAccountId: campaign.corporateAccountId,
      matchDate: {
        gte: campaign.startDate,
        lte: campaign.endDate,
      },
    },
  });

  // Get employees with their departments
  const employees = await prisma.corporateEmployee.findMany({
    where: {
      corporateAccountId: campaign.corporateAccountId,
      userId: { in: records.map((r) => r.userId) },
    },
    select: {
      userId: true,
      department: true,
    },
  });

  const userDeptMap = new Map(employees.map((e) => [e.userId, e.department || 'Other']));

  // Aggregate by department
  const deptStats: Record<string, { totalGiven: number; participants: Set<string> }> = {};

  for (const record of records) {
    const dept = userDeptMap.get(record.userId) || 'Other';
    if (!deptStats[dept]) {
      deptStats[dept] = { totalGiven: 0, participants: new Set() };
    }
    deptStats[dept].totalGiven += record.originalAmount + record.matchedAmount;
    deptStats[dept].participants.add(record.userId);
  }

  // Convert to array and sort
  const leaderboard = Object.entries(deptStats)
    .map(([department, stats]) => ({
      department,
      totalGiven: stats.totalGiven,
      participantCount: stats.participants.size,
    }))
    .sort((a, b) => b.totalGiven - a.totalGiven);

  return leaderboard;
}

// Parse JSON array helper
export function parseFeaturedProjects(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseCategories(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
