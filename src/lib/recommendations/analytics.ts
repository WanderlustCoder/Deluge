// Recommendation analytics and metrics

import { prisma } from '@/lib/prisma';

// Track recommendation metrics
export async function trackRecommendationMetrics(
  algorithm: string,
  entityType: string,
  impressions: number,
  clicks: number,
  conversions: number
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.recommendationMetrics.upsert({
    where: {
      date_algorithm_entityType: {
        date: today,
        algorithm,
        entityType,
      },
    },
    update: {
      impressions: { increment: impressions },
      clicks: { increment: clicks },
      conversions: { increment: conversions },
    },
    create: {
      date: today,
      algorithm,
      entityType,
      impressions,
      clicks,
      conversions,
    },
  });
}

// Get recommendation performance metrics
export async function getRecommendationMetrics(
  days: number = 30
): Promise<{
  byAlgorithm: Array<{
    algorithm: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }>;
  byDay: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const metrics = await prisma.recommendationMetrics.findMany({
    where: { date: { gte: since } },
    orderBy: { date: 'desc' },
  });

  // Aggregate by algorithm
  const byAlgorithmMap = new Map<string, {
    impressions: number;
    clicks: number;
    conversions: number;
  }>();

  for (const m of metrics) {
    const existing = byAlgorithmMap.get(m.algorithm) || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
    };
    existing.impressions += m.impressions;
    existing.clicks += m.clicks;
    existing.conversions += m.conversions;
    byAlgorithmMap.set(m.algorithm, existing);
  }

  const byAlgorithm = Array.from(byAlgorithmMap.entries()).map(([algorithm, data]) => ({
    algorithm,
    ...data,
    ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
    conversionRate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0,
  }));

  // Aggregate by day
  const byDayMap = new Map<string, {
    impressions: number;
    clicks: number;
    conversions: number;
  }>();

  for (const m of metrics) {
    const dateStr = m.date.toISOString().split('T')[0];
    const existing = byDayMap.get(dateStr) || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
    };
    existing.impressions += m.impressions;
    existing.clicks += m.clicks;
    existing.conversions += m.conversions;
    byDayMap.set(dateStr, existing);
  }

  const byDay = Array.from(byDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { byAlgorithm, byDay };
}

// Get recommendation effectiveness for a user
export async function getUserRecommendationStats(userId: string): Promise<{
  totalRecommendations: number;
  viewed: number;
  clicked: number;
  converted: number;
  topReasons: Array<{ reason: string; count: number }>;
}> {
  const recommendations = await prisma.recommendation.findMany({
    where: { userId },
    select: {
      shown: true,
      clicked: true,
      converted: true,
      reason: true,
    },
  });

  const reasonCounts = new Map<string, number>();
  let viewed = 0;
  let clicked = 0;
  let converted = 0;

  for (const rec of recommendations) {
    if (rec.shown) viewed++;
    if (rec.clicked) clicked++;
    if (rec.converted) converted++;
    reasonCounts.set(rec.reason, (reasonCounts.get(rec.reason) || 0) + 1);
  }

  const topReasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRecommendations: recommendations.length,
    viewed,
    clicked,
    converted,
    topReasons,
  };
}

// Get overall platform recommendation health
export async function getRecommendationHealth(): Promise<{
  avgCTR: number;
  avgConversionRate: number;
  coverageRate: number; // % of users getting recommendations
  freshnessScore: number; // How recent are recommendations
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [metrics, activeUsers, usersWithRecs, freshRecs] = await Promise.all([
    prisma.recommendationMetrics.aggregate({
      where: { date: { gte: thirtyDaysAgo } },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
      },
    }),
    prisma.user.count({
      where: { lastLoginAt: { gte: thirtyDaysAgo } },
    }),
    prisma.recommendation.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      distinct: ['userId'],
    }),
    prisma.recommendation.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const impressions = metrics._sum.impressions || 0;
  const clicks = metrics._sum.clicks || 0;
  const conversions = metrics._sum.conversions || 0;

  return {
    avgCTR: impressions > 0 ? (clicks / impressions) * 100 : 0,
    avgConversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    coverageRate: activeUsers > 0 ? (usersWithRecs.length / activeUsers) * 100 : 0,
    freshnessScore: freshRecs > 100 ? 100 : freshRecs, // Simple freshness metric
  };
}

// Clean up old metrics
export async function cleanupOldMetrics(daysOld: number = 90): Promise<number> {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const result = await prisma.recommendationMetrics.deleteMany({
    where: { date: { lt: cutoff } },
  });

  return result.count;
}

// Log a recommendation event
export async function logRecommendationEvent(
  event: 'impression' | 'click' | 'conversion',
  algorithm: string,
  entityType: string
): Promise<void> {
  await trackRecommendationMetrics(
    algorithm,
    entityType,
    event === 'impression' ? 1 : 0,
    event === 'click' ? 1 : 0,
    event === 'conversion' ? 1 : 0
  );
}
