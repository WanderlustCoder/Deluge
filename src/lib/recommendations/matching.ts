// Project-user matching for smart recommendations

import { prisma } from '@/lib/prisma';
import { getInterestProfile } from './interests';

// Match factors and weights
const MATCH_WEIGHTS = {
  category: 0.35,
  community: 0.25,
  history: 0.20,
  location: 0.10,
  timing: 0.10,
};

export interface MatchBreakdown {
  category: number;
  community: number;
  history: number;
  location: number;
  timing: number;
}

export interface MatchResult {
  score: number;
  breakdown: MatchBreakdown;
  highlights: string[];
}

// Calculate match score between user and project
export async function calculateMatchScore(
  userId: string,
  projectId: string
): Promise<MatchResult> {
  const [profile, project, userHistory] = await Promise.all([
    getInterestProfile(userId),
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        communities: {
          include: {
            community: { select: { id: true, name: true } },
          },
        },
      },
    }),
    getUserFundingHistory(userId),
  ]);

  if (!project) {
    return { score: 0, breakdown: defaultBreakdown(), highlights: [] };
  }

  const highlights: string[] = [];
  const breakdown: MatchBreakdown = {
    category: 0,
    community: 0,
    history: 0,
    location: 0,
    timing: 0,
  };

  // Category match
  const categoryScore = profile.categories[project.category] || 0;
  breakdown.category = categoryScore;
  if (categoryScore > 0.5) {
    highlights.push(`Strong interest in ${project.category}`);
  }

  // Community match
  let maxCommunityScore = 0;
  let matchedCommunity: string | null = null;
  for (const cp of project.communities) {
    const score = profile.communities[cp.community.id] || 0;
    if (score > maxCommunityScore) {
      maxCommunityScore = score;
      matchedCommunity = cp.community.name;
    }
  }
  breakdown.community = maxCommunityScore;
  if (matchedCommunity && maxCommunityScore > 0.5) {
    highlights.push(`Connected to ${matchedCommunity}`);
  }

  // History match - similar projects funded before
  breakdown.history = calculateHistoryMatch(project, userHistory);
  if (breakdown.history > 0.5) {
    highlights.push('Similar to projects you\'ve supported');
  }

  // Location match
  breakdown.location = calculateLocationMatch(project.location, profile.locationPrefs);
  if (breakdown.location > 0.7) {
    highlights.push('In your local area');
  }

  // Timing match
  const fundedPercent = (project.fundingRaised / project.fundingGoal) * 100;
  breakdown.timing = calculateTimingMatch(fundedPercent, profile.timePrefs);
  if (fundedPercent >= 75 && fundedPercent < 100 && profile.timePrefs.preferAlmostFunded) {
    highlights.push('Almost fully funded!');
  }

  // Calculate weighted score
  const score =
    breakdown.category * MATCH_WEIGHTS.category +
    breakdown.community * MATCH_WEIGHTS.community +
    breakdown.history * MATCH_WEIGHTS.history +
    breakdown.location * MATCH_WEIGHTS.location +
    breakdown.timing * MATCH_WEIGHTS.timing;

  return { score: Math.min(1, score), breakdown, highlights };
}

// Get user's funding history for comparison
async function getUserFundingHistory(userId: string): Promise<{
  categories: { [cat: string]: number };
  avgAmount: number;
}> {
  const allocations = await prisma.allocation.findMany({
    where: { userId },
    include: { project: { select: { category: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const categories: { [cat: string]: number } = {};
  let totalAmount = 0;

  for (const alloc of allocations) {
    categories[alloc.project.category] = (categories[alloc.project.category] || 0) + 1;
    totalAmount += alloc.amount;
  }

  return {
    categories,
    avgAmount: allocations.length > 0 ? totalAmount / allocations.length : 0,
  };
}

// Calculate history-based match
function calculateHistoryMatch(
  project: { category: string },
  history: { categories: { [cat: string]: number } }
): number {
  const categoryFunded = history.categories[project.category] || 0;
  const totalFunded = Object.values(history.categories).reduce((a, b) => a + b, 0);

  if (totalFunded === 0) return 0.5; // Neutral for new users
  return Math.min(1, categoryFunded / Math.max(1, totalFunded / 3));
}

// Calculate location match
function calculateLocationMatch(
  projectLocation: string,
  prefs: { radiusMiles?: number; includeRemote?: boolean }
): number {
  // Simple match for now - would use geocoding in production
  if (prefs.includeRemote) return 0.7;
  return 0.5; // Neutral
}

// Calculate timing match
function calculateTimingMatch(
  fundedPercent: number,
  prefs: { preferUrgent?: boolean; preferNew?: boolean; preferAlmostFunded?: boolean }
): number {
  let score = 0.5;

  if (prefs.preferAlmostFunded && fundedPercent >= 75 && fundedPercent < 100) {
    score = 1.0;
  } else if (prefs.preferNew && fundedPercent < 25) {
    score = 0.8;
  }

  return score;
}

function defaultBreakdown(): MatchBreakdown {
  return { category: 0, community: 0, history: 0, location: 0, timing: 0 };
}

// Store match score for quick access
export async function storeMatchScore(
  userId: string,
  projectId: string,
  result: MatchResult
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.matchScore.upsert({
    where: { userId_projectId: { userId, projectId } },
    update: {
      score: result.score,
      breakdown: JSON.stringify(result.breakdown),
      calculatedAt: new Date(),
      expiresAt,
    },
    create: {
      userId,
      projectId,
      score: result.score,
      breakdown: JSON.stringify(result.breakdown),
      expiresAt,
    },
  });
}

// Get cached match score
export async function getCachedMatchScore(
  userId: string,
  projectId: string
): Promise<MatchResult | null> {
  const cached = await prisma.matchScore.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!cached || cached.expiresAt < new Date()) {
    return null;
  }

  return {
    score: cached.score,
    breakdown: JSON.parse(cached.breakdown),
    highlights: [], // Would need to regenerate
  };
}

// Get best matches for a user
export async function getBestMatches(
  userId: string,
  limit: number = 20
): Promise<Array<{ projectId: string; score: number; highlights: string[] }>> {
  // Get active projects
  const projects = await prisma.project.findMany({
    where: { status: 'active' },
    select: { id: true },
    take: 100,
  });

  // Get user's funded projects to exclude
  const userFunded = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const fundedSet = new Set(userFunded.map(a => a.projectId));

  // Calculate match scores
  const matches: Array<{ projectId: string; score: number; highlights: string[] }> = [];

  for (const project of projects) {
    if (fundedSet.has(project.id)) continue;

    const result = await calculateMatchScore(userId, project.id);
    if (result.score > 0.3) {
      matches.push({
        projectId: project.id,
        score: result.score,
        highlights: result.highlights,
      });

      // Cache the result
      await storeMatchScore(userId, project.id, result);
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
