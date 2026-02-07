import { prisma } from './prisma';

export type CampaignStatus = 'draft' | 'active' | 'completed';

// Get active seasonal campaigns
export async function getActiveCampaigns() {
  const now = new Date();

  return prisma.seasonalCampaign.findMany({
    where: {
      status: 'active',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
  });
}

// Get all campaigns (for admin)
export async function getAllCampaigns(options?: { status?: CampaignStatus; limit?: number }) {
  const where: Record<string, unknown> = {};

  if (options?.status) {
    where.status = options.status;
  }

  return prisma.seasonalCampaign.findMany({
    where,
    orderBy: { startDate: 'desc' },
    take: options?.limit || 50,
  });
}

// Get campaign by slug
export async function getCampaignBySlug(slug: string) {
  return prisma.seasonalCampaign.findUnique({
    where: { slug },
  });
}

// Create seasonal campaign (admin only)
export async function createSeasonalCampaign(data: {
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  startDate: Date;
  endDate: Date;
  platformGoal?: number;
  matchingPartner?: string;
  matchingRatio?: number;
  heroImageUrl?: string;
  themeColor?: string;
  featuredProjects?: string[];
  badges?: string[];
}) {
  return prisma.seasonalCampaign.create({
    data: {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      platformGoal: data.platformGoal,
      matchingPartner: data.matchingPartner,
      matchingRatio: data.matchingRatio,
      heroImageUrl: data.heroImageUrl,
      themeColor: data.themeColor,
      featuredProjects: data.featuredProjects?.join(','),
      badges: data.badges?.join(','),
      status: 'draft',
    },
  });
}

// Update seasonal campaign
export async function updateSeasonalCampaign(
  id: string,
  data: Partial<{
    name: string;
    tagline: string;
    description: string;
    startDate: Date;
    endDate: Date;
    platformGoal: number;
    platformProgress: number;
    matchingPartner: string;
    matchingRatio: number;
    heroImageUrl: string;
    themeColor: string;
    featuredProjects: string[];
    badges: string[];
    status: CampaignStatus;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.featuredProjects) {
    updateData.featuredProjects = data.featuredProjects.join(',');
  }
  if (data.badges) {
    updateData.badges = data.badges.join(',');
  }

  return prisma.seasonalCampaign.update({
    where: { id },
    data: updateData,
  });
}

// Activate campaign
export async function activateCampaign(id: string) {
  return prisma.seasonalCampaign.update({
    where: { id },
    data: { status: 'active' },
  });
}

// Complete campaign
export async function completeCampaign(id: string) {
  return prisma.seasonalCampaign.update({
    where: { id },
    data: { status: 'completed' },
  });
}

// Update campaign progress
export async function updateCampaignProgress(id: string, amount: number) {
  return prisma.seasonalCampaign.update({
    where: { id },
    data: { platformProgress: { increment: amount } },
  });
}

// Get featured projects for a campaign
export async function getCampaignProjects(campaign: { featuredProjects: string | null }) {
  if (!campaign.featuredProjects) return [];

  const projectIds = campaign.featuredProjects.split(',').filter(Boolean);
  if (projectIds.length === 0) return [];

  return prisma.project.findMany({
    where: { id: { in: projectIds }, status: 'active' },
  });
}

// Get campaign badges
export function getCampaignBadges(campaign: { badges: string | null }): string[] {
  if (!campaign.badges) return [];
  return campaign.badges.split(',').filter(Boolean);
}

// Check if project is in an active campaign
export async function getProjectCampaign(projectId: string) {
  const now = new Date();

  const campaigns = await prisma.seasonalCampaign.findMany({
    where: {
      status: 'active',
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  for (const campaign of campaigns) {
    if (campaign.featuredProjects) {
      const projectIds = campaign.featuredProjects.split(',');
      if (projectIds.includes(projectId)) {
        return campaign;
      }
    }
  }

  return null;
}

// Calculate campaign progress percentage
export function calculateCampaignProgress(
  platformProgress: number,
  platformGoal: number | null
): number {
  if (!platformGoal || platformGoal === 0) return 0;
  return Math.min(100, (platformProgress / platformGoal) * 100);
}

// Get campaign time remaining
export function getCampaignTimeRemaining(endDate: Date): {
  days: number;
  hours: number;
  isEnded: boolean;
} {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, isEnded: true };
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return { days, hours, isEnded: false };
}

// Get campaign stats
export async function getCampaignStats(campaignId: string) {
  const campaign = await prisma.seasonalCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) return null;

  const projectIds = campaign.featuredProjects?.split(',').filter(Boolean) || [];

  if (projectIds.length === 0) {
    return {
      projectCount: 0,
      totalRaised: campaign.platformProgress,
      backerCount: 0,
      matchingApplied: 0,
    };
  }

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { fundingRaised: true, backerCount: true },
  });

  const totalRaised = projects.reduce((sum, p) => sum + p.fundingRaised, 0);
  const backerCount = projects.reduce((sum, p) => sum + p.backerCount, 0);

  return {
    projectCount: projects.length,
    totalRaised,
    backerCount,
    matchingApplied: campaign.matchingRatio
      ? totalRaised * campaign.matchingRatio
      : 0,
  };
}
