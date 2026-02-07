import { prisma } from './prisma';

// Get all active occasions
export async function getActiveOccasions() {
  const now = new Date();
  return prisma.givingOccasion.findMany({
    where: {
      status: 'active',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
  });
}

// Get upcoming occasions (within 30 days)
export async function getUpcomingOccasions(days = 30) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.givingOccasion.findMany({
    where: {
      status: 'active',
      startDate: { gt: now, lte: future },
    },
    orderBy: { startDate: 'asc' },
  });
}

// Get occasion by slug
export async function getOccasionBySlug(slug: string) {
  return prisma.givingOccasion.findUnique({
    where: { slug },
  });
}

// Get occasions by type
export async function getOccasionsByType(type: string) {
  return prisma.givingOccasion.findMany({
    where: { type, status: 'active' },
    orderBy: { startDate: 'asc' },
  });
}

// Create an occasion
export async function createOccasion(data: {
  name: string;
  slug: string;
  type: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  iconName?: string;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  matchingBonus?: number;
  featuredProjects?: string[];
  categories?: string[];
  isGlobal?: boolean;
  communityId?: string;
}) {
  return prisma.givingOccasion.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      imageUrl: data.imageUrl,
      iconName: data.iconName,
      color: data.color,
      isRecurring: data.isRecurring ?? false,
      recurrenceRule: data.recurrenceRule,
      matchingBonus: data.matchingBonus,
      featuredProjects: data.featuredProjects?.join(','),
      categories: data.categories?.join(','),
      isGlobal: data.isGlobal ?? true,
      communityId: data.communityId,
      status: 'active',
    },
  });
}

// Update an occasion
export async function updateOccasion(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    imageUrl: string;
    iconName: string;
    color: string;
    matchingBonus: number;
    featuredProjects: string[];
    categories: string[];
    status: string;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.featuredProjects) {
    updateData.featuredProjects = data.featuredProjects.join(',');
  }
  if (data.categories) {
    updateData.categories = data.categories.join(',');
  }

  return prisma.givingOccasion.update({
    where: { id },
    data: updateData,
  });
}

// Get featured projects for an occasion
export async function getOccasionProjects(occasion: { featuredProjects: string | null }) {
  if (!occasion.featuredProjects) return [];

  const projectIds = occasion.featuredProjects.split(',').filter(Boolean);
  if (projectIds.length === 0) return [];

  return prisma.project.findMany({
    where: { id: { in: projectIds }, status: 'active' },
  });
}

// Check if occasion has matching bonus
export async function getOccasionMatchingBonus(projectId: string): Promise<number> {
  const now = new Date();

  const occasions = await prisma.givingOccasion.findMany({
    where: {
      status: 'active',
      startDate: { lte: now },
      endDate: { gte: now },
      matchingBonus: { not: null },
    },
  });

  // Check if project is featured in any active occasion with matching
  for (const occasion of occasions) {
    if (occasion.featuredProjects) {
      const projectIds = occasion.featuredProjects.split(',');
      if (projectIds.includes(projectId) && occasion.matchingBonus) {
        return occasion.matchingBonus;
      }
    }
  }

  return 0;
}

// Helper to parse comma-separated fields
export function parseOccasionArrayField(field: string | null): string[] {
  if (!field) return [];
  return field.split(',').filter(Boolean);
}

// Get occasion stats
export async function getOccasionStats(occasionId: string) {
  const occasion = await prisma.givingOccasion.findUnique({
    where: { id: occasionId },
  });

  if (!occasion) return null;

  const projectIds = parseOccasionArrayField(occasion.featuredProjects);

  if (projectIds.length === 0) {
    return {
      totalRaised: 0,
      backerCount: 0,
      projectCount: 0,
    };
  }

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { fundingRaised: true, backerCount: true },
  });

  return {
    totalRaised: projects.reduce((sum, p) => sum + p.fundingRaised, 0),
    backerCount: projects.reduce((sum, p) => sum + p.backerCount, 0),
    projectCount: projects.length,
  };
}
