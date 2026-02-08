/**
 * AI Recommendations Engine
 * Plan 28: AI-Powered Platform Features
 *
 * Personalized project recommendations based on user behavior and interests.
 */

import { prisma } from '@/lib/prisma';

export interface RecommendedProject {
  id: string;
  title: string;
  category: string;
  fundingRaised: number;
  fundingGoal: number;
  score: number;
  reasons: string[];
}

export interface RecommendationContext {
  userId: string;
  limit?: number;
  excludeIds?: string[];
}

/**
 * Get user's interest profile from their behavior
 */
async function getUserInterests(userId: string): Promise<{
  categories: Record<string, number>;
  communities: string[];
  avgContribution: number;
}> {
  // Get user's past allocations
  const allocations = await prisma.allocation.findMany({
    where: { userId },
    include: {
      project: { select: { category: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Get community memberships
  const memberships = await prisma.communityMember.findMany({
    where: { userId },
    select: { communityId: true },
  });

  // Calculate category preferences
  const categories: Record<string, number> = {};
  let totalAmount = 0;

  for (const alloc of allocations) {
    const cat = alloc.project.category;
    categories[cat] = (categories[cat] || 0) + alloc.amount;
    totalAmount += alloc.amount;
  }

  // Normalize category scores
  if (totalAmount > 0) {
    for (const cat of Object.keys(categories)) {
      categories[cat] = categories[cat] / totalAmount;
    }
  }

  return {
    categories,
    communities: memberships.map((m) => m.communityId),
    avgContribution: allocations.length > 0
      ? totalAmount / allocations.length
      : 0,
  };
}

/**
 * Score a project for a user
 */
function scoreProject(
  project: {
    id: string;
    category: string;
    communities: Array<{ communityId: string }>;
    fundingRaised: number;
    fundingGoal: number;
    createdAt: Date;
  },
  interests: {
    categories: Record<string, number>;
    communities: string[];
    avgContribution: number;
  }
): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Category match
  const categoryWeight = interests.categories[project.category] || 0;
  if (categoryWeight > 0.2) {
    score += 30;
    reasons.push(`You\'ve supported ${project.category} projects before`);
  } else if (categoryWeight > 0) {
    score += 15;
    reasons.push(`Related to your interests`);
  }

  // Community match
  const projectCommunities = project.communities.map((cp) => cp.communityId);
  const communityMatch = projectCommunities.some((c) =>
    interests.communities.includes(c)
  );
  if (communityMatch) {
    score += 25;
    reasons.push('From a community you\'re part of');
  }

  // Funding momentum
  const fundingPercent = (project.fundingRaised / project.fundingGoal) * 100;
  if (fundingPercent >= 75 && fundingPercent < 100) {
    score += 15;
    reasons.push('Almost funded!');
  } else if (fundingPercent >= 50) {
    score += 10;
    reasons.push('Good funding momentum');
  }

  // Recency bonus
  const daysSinceCreation = Math.floor(
    (Date.now() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreation < 7) {
    score += 10;
    reasons.push('New project');
  }

  return { score: Math.min(100, score), reasons };
}

/**
 * Get personalized project recommendations
 */
export async function getRecommendations(
  context: RecommendationContext
): Promise<RecommendedProject[]> {
  const { userId, limit = 10, excludeIds = [] } = context;

  // Get user interests
  const interests = await getUserInterests(userId);

  // Get active projects
  const projects = await prisma.project.findMany({
    where: {
      status: 'active',
      id: { notIn: excludeIds },
    },
    include: {
      communities: {
        select: { communityId: true },
      },
    },
    take: 100, // Get more to score and filter
  });

  // Filter out projects user has already funded
  const userFundedIds = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  }).then((allocs) => allocs.map((a) => a.projectId));

  const unfundedProjects = projects.filter(
    (p) => !userFundedIds.includes(p.id)
  );

  // Score and sort projects
  const scoredProjects = unfundedProjects.map((project) => {
    const { score, reasons } = scoreProject(project, interests);
    return {
      id: project.id,
      title: project.title,
      category: project.category,
      fundingRaised: project.fundingRaised,
      fundingGoal: project.fundingGoal,
      score,
      reasons,
    };
  });

  // Sort by score and return top N
  scoredProjects.sort((a, b) => b.score - a.score);

  return scoredProjects.slice(0, limit);
}

/**
 * Get similar projects to a given project
 */
export async function getSimilarProjects(
  projectId: string,
  limit: number = 5
): Promise<RecommendedProject[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      communities: { select: { communityId: true } },
    },
  });

  if (!project) return [];

  // Find projects in same category or communities
  const projectCommunityIds = project.communities.map((cp) => cp.communityId);

  const candidates = await prisma.project.findMany({
    where: {
      id: { not: projectId },
      status: 'active',
      OR: [
        { category: project.category },
        {
          communities: {
            some: { communityId: { in: projectCommunityIds } },
          },
        },
      ],
    },
    include: {
      communities: { select: { communityId: true } },
    },
    take: 20,
  });

  // Score similarity
  const scored = candidates.map((candidate) => {
    let score = 0;
    const reasons: string[] = [];

    if (candidate.category === project.category) {
      score += 50;
      reasons.push(`Same category: ${project.category}`);
    }

    const sharedCommunities = candidate.communities.filter((cp) =>
      projectCommunityIds.includes(cp.communityId)
    ).length;
    if (sharedCommunities > 0) {
      score += sharedCommunities * 25;
      reasons.push(`${sharedCommunities} shared ${sharedCommunities === 1 ? 'community' : 'communities'}`);
    }

    return {
      id: candidate.id,
      title: candidate.title,
      category: candidate.category,
      fundingRaised: candidate.fundingRaised,
      fundingGoal: candidate.fundingGoal,
      score,
      reasons,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Get trending projects
 */
export async function getTrendingProjects(
  limit: number = 10
): Promise<RecommendedProject[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get projects with recent funding activity
  const projectsWithActivity = await prisma.allocation.groupBy({
    by: ['projectId'],
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    _sum: { amount: true },
    _count: true,
    orderBy: { _count: { amount: 'desc' } },
    take: limit * 2,
  });

  const projectIds = projectsWithActivity.map((p) => p.projectId);

  const projects = await prisma.project.findMany({
    where: {
      id: { in: projectIds },
      status: 'active',
    },
  });

  return projects.map((project) => {
    const activity = projectsWithActivity.find((a) => a.projectId === project.id);
    return {
      id: project.id,
      title: project.title,
      category: project.category,
      fundingRaised: project.fundingRaised,
      fundingGoal: project.fundingGoal,
      score: (activity?._count || 0) * 10 + (activity?._sum.amount || 0) / 10,
      reasons: ['Trending this week'],
    };
  }).slice(0, limit);
}
