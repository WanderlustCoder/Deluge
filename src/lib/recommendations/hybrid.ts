// Hybrid recommendation system combining multiple strategies

import { prisma } from '@/lib/prisma';
import { getCollaborativeRecommendations } from './collaborative';
import { getContentBasedRecommendations } from './content-based';
import { getInterestProfile } from './interests';

// Weights for different recommendation strategies
const STRATEGY_WEIGHTS = {
  collaborative: 0.35,
  contentBased: 0.35,
  trending: 0.15,
  new: 0.15,
};

export interface RecommendationResult {
  entityType: 'project' | 'community' | 'loan';
  entityId: string;
  score: number;
  reason: string;
  signals: {
    collaborative?: number;
    contentBased?: number;
    trending?: number;
    new?: number;
    diversity?: number;
  };
}

// Generate hybrid recommendations
export async function getHybridRecommendations(
  userId: string,
  limit: number = 20
): Promise<RecommendationResult[]> {
  // Get recommendations from each strategy
  const [collaborative, contentBased, trending, newProjects] = await Promise.all([
    getCollaborativeRecommendations(userId, 30),
    getContentBasedRecommendations(userId, 30),
    getTrendingProjects(30),
    getNewProjects(30),
  ]);

  // Merge and score recommendations
  const projectScores = new Map<string, RecommendationResult>();

  // Add collaborative recommendations
  for (const rec of collaborative) {
    const existing = projectScores.get(rec.projectId);
    if (existing) {
      existing.score += rec.score * STRATEGY_WEIGHTS.collaborative;
      existing.signals.collaborative = rec.score;
    } else {
      projectScores.set(rec.projectId, {
        entityType: 'project',
        entityId: rec.projectId,
        score: rec.score * STRATEGY_WEIGHTS.collaborative,
        reason: rec.reason,
        signals: { collaborative: rec.score },
      });
    }
  }

  // Add content-based recommendations
  for (const rec of contentBased) {
    const existing = projectScores.get(rec.projectId);
    if (existing) {
      existing.score += rec.score * STRATEGY_WEIGHTS.contentBased;
      existing.signals.contentBased = rec.score;
      // Keep the more specific reason
      if (rec.reason.length > existing.reason.length) {
        existing.reason = rec.reason;
      }
    } else {
      projectScores.set(rec.projectId, {
        entityType: 'project',
        entityId: rec.projectId,
        score: rec.score * STRATEGY_WEIGHTS.contentBased,
        reason: rec.reason,
        signals: { contentBased: rec.score },
      });
    }
  }

  // Add trending recommendations
  for (const rec of trending) {
    const existing = projectScores.get(rec.projectId);
    if (existing) {
      existing.score += rec.score * STRATEGY_WEIGHTS.trending;
      existing.signals.trending = rec.score;
    } else {
      projectScores.set(rec.projectId, {
        entityType: 'project',
        entityId: rec.projectId,
        score: rec.score * STRATEGY_WEIGHTS.trending,
        reason: 'Trending in your area',
        signals: { trending: rec.score },
      });
    }
  }

  // Add new project recommendations
  for (const rec of newProjects) {
    const existing = projectScores.get(rec.projectId);
    if (existing) {
      existing.score += rec.score * STRATEGY_WEIGHTS.new;
      existing.signals.new = rec.score;
    } else {
      projectScores.set(rec.projectId, {
        entityType: 'project',
        entityId: rec.projectId,
        score: rec.score * STRATEGY_WEIGHTS.new,
        reason: 'Recently launched',
        signals: { new: rec.score },
      });
    }
  }

  // Apply diversity bonus
  const results = Array.from(projectScores.values());
  applyDiversityBonus(results);

  // Sort by score and return top results
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Get trending projects
async function getTrendingProjects(
  limit: number
): Promise<Array<{ projectId: string; score: number }>> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get projects with recent funding activity
  const recentFunding = await prisma.allocation.groupBy({
    by: ['projectId'],
    where: {
      createdAt: { gte: weekAgo },
      project: { status: 'active' },
    },
    _count: { id: true },
    _sum: { amount: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  return recentFunding.map((pf) => ({
    projectId: pf.projectId,
    score: Math.min(1, (pf._count.id * 0.1) + ((pf._sum.amount || 0) * 0.001)),
  }));
}

// Get new projects
async function getNewProjects(
  limit: number
): Promise<Array<{ projectId: string; score: number }>> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const newProjects = await prisma.project.findMany({
    where: {
      status: 'active',
      createdAt: { gte: weekAgo },
    },
    select: {
      id: true,
      createdAt: true,
      fundingRaised: true,
      fundingGoal: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return newProjects.map((p) => {
    // Score based on recency and early momentum
    const daysOld = (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysOld / 7);
    const momentumScore = p.fundingGoal > 0 ? (p.fundingRaised / p.fundingGoal) * 0.5 : 0;

    return {
      projectId: p.id,
      score: recencyScore * 0.7 + momentumScore * 0.3,
    };
  });
}

// Apply diversity bonus to avoid too many similar recommendations
function applyDiversityBonus(results: RecommendationResult[]): void {
  // This would ideally check categories and spread them out
  // For now, we'll just add small random diversity
  for (const result of results) {
    result.signals.diversity = Math.random() * 0.1;
    result.score += result.signals.diversity;
  }
}

// Store recommendations for later tracking
export async function storeRecommendations(
  userId: string,
  recommendations: RecommendationResult[]
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  for (const rec of recommendations) {
    await prisma.recommendation.upsert({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType: rec.entityType,
          entityId: rec.entityId,
        },
      },
      update: {
        score: rec.score,
        reason: rec.reason,
        signals: JSON.stringify(rec.signals),
        expiresAt,
      },
      create: {
        userId,
        entityType: rec.entityType,
        entityId: rec.entityId,
        score: rec.score,
        reason: rec.reason,
        signals: JSON.stringify(rec.signals),
        expiresAt,
      },
    });
  }
}

// Track when a recommendation is shown
export async function trackRecommendationShown(
  userId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  await prisma.recommendation.updateMany({
    where: { userId, entityType, entityId },
    data: { shown: true, shownAt: new Date() },
  });
}

// Track when a recommendation is clicked
export async function trackRecommendationClicked(
  userId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  await prisma.recommendation.updateMany({
    where: { userId, entityType, entityId },
    data: { clicked: true, clickedAt: new Date() },
  });
}

// Track when a recommendation converts (user funds/joins)
export async function trackRecommendationConverted(
  userId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  await prisma.recommendation.updateMany({
    where: { userId, entityType, entityId },
    data: { converted: true },
  });
}
