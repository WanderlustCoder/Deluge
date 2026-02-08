// Content-based filtering for recommendations

import { prisma } from '@/lib/prisma';
import { getInterestProfile, CategoryWeights } from './interests';

// Get content-based recommendations for a user
export async function getContentBasedRecommendations(
  userId: string,
  limit: number = 20
): Promise<Array<{ projectId: string; score: number; reason: string }>> {
  const profile = await getInterestProfile(userId);

  // Get active projects
  const projects = await prisma.project.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
      category: true,
      location: true,
      fundingGoal: true,
      fundingRaised: true,
      communities: {
        select: { communityId: true },
      },
    },
  });

  // Score each project
  const scored = projects.map((project) => {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    const categoryWeight = profile.categories[project.category] || 0;
    if (categoryWeight > 0) {
      score += categoryWeight * 0.4;
      reasons.push(`Matches your interest in ${project.category}`);
    }

    // Community match
    for (const cp of project.communities) {
      const communityWeight = profile.communities[cp.communityId] || 0;
      if (communityWeight > 0) {
        score += communityWeight * 0.3;
        reasons.push('From a community you follow');
        break;
      }
    }

    // Urgency preference
    const fundedPercent = (project.fundingRaised / project.fundingGoal) * 100;
    if (profile.timePrefs.preferAlmostFunded && fundedPercent >= 75) {
      score += 0.2;
      reasons.push('Almost fully funded');
    }

    // New project preference
    if (profile.timePrefs.preferNew && fundedPercent < 25) {
      score += 0.1;
      reasons.push('New project');
    }

    return {
      projectId: project.id,
      score,
      reason: reasons[0] || 'Recommended for you',
    };
  });

  // Filter out already-funded projects
  const userFunded = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const fundedSet = new Set(userFunded.map(a => a.projectId));

  return scored
    .filter((s) => s.score > 0 && !fundedSet.has(s.projectId))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get category-specific recommendations
export async function getCategoryRecommendations(
  userId: string,
  category: string,
  limit: number = 20
): Promise<Array<{ projectId: string; score: number }>> {
  const profile = await getInterestProfile(userId);

  // Get projects in this category
  const projects = await prisma.project.findMany({
    where: {
      status: 'active',
      category,
    },
    include: {
      communities: {
        select: { communityId: true },
      },
      _count: {
        select: { allocations: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get user's funded projects to exclude
  const userFunded = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const fundedSet = new Set(userFunded.map(a => a.projectId));

  const scored = projects
    .filter((p) => !fundedSet.has(p.id))
    .map((project) => {
      let score = 0.5; // Base score for being in requested category

      // Boost for community membership
      for (const cp of project.communities) {
        if (profile.communities[cp.communityId]) {
          score += 0.2;
          break;
        }
      }

      // Boost for popularity
      score += Math.min(0.2, project._count.allocations * 0.01);

      // Boost for progress
      const progress = project.fundingRaised / project.fundingGoal;
      if (progress >= 0.5 && progress < 1) {
        score += 0.1;
      }

      return { projectId: project.id, score };
    });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Match user preferences to project attributes
export function calculateContentMatch(
  userCategories: CategoryWeights,
  projectCategory: string,
  projectCommunities: string[],
  userCommunities: { [id: string]: number }
): number {
  let score = 0;

  // Category match
  const categoryScore = userCategories[projectCategory] || 0;
  score += categoryScore * 0.6;

  // Community match
  let maxCommunityScore = 0;
  for (const communityId of projectCommunities) {
    const communityScore = userCommunities[communityId] || 0;
    maxCommunityScore = Math.max(maxCommunityScore, communityScore);
  }
  score += maxCommunityScore * 0.4;

  return score;
}

// Get text similarity score (simple keyword matching)
export function getTextSimilarity(
  userInterests: string[],
  projectTitle: string,
  projectDescription: string
): number {
  const projectText = `${projectTitle} ${projectDescription}`.toLowerCase();
  let matches = 0;

  for (const interest of userInterests) {
    if (projectText.includes(interest.toLowerCase())) {
      matches++;
    }
  }

  return userInterests.length > 0 ? matches / userInterests.length : 0;
}

// Get location-based recommendations
export async function getLocationRecommendations(
  userId: string,
  radiusMiles: number = 50,
  limit: number = 20
): Promise<Array<{ projectId: string; score: number; distance?: number }>> {
  // For now, use community-based location matching
  // In production, would use actual geocoding

  // Get user's community memberships
  const memberships = await prisma.communityMember.findMany({
    where: { userId },
    include: {
      community: {
        select: { id: true, location: true },
      },
    },
  });

  const userLocations = new Set(
    memberships.map((m) => m.community.location).filter(Boolean)
  );

  // Get projects in those locations
  const projects = await prisma.project.findMany({
    where: {
      status: 'active',
      location: { in: Array.from(userLocations) as string[] },
    },
    select: {
      id: true,
      location: true,
      fundingGoal: true,
      fundingRaised: true,
    },
  });

  // Get user's funded projects to exclude
  const userFunded = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const fundedSet = new Set(userFunded.map(a => a.projectId));

  return projects
    .filter((p) => !fundedSet.has(p.id))
    .map((project) => ({
      projectId: project.id,
      score: 0.8, // High score for local projects
    }))
    .slice(0, limit);
}
