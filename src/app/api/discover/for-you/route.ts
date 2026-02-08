// GET /api/discover/for-you - Personalized recommendations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getHybridRecommendations, storeRecommendations, trackRecommendationShown } from '@/lib/recommendations/hybrid';
import { logRecommendationEvent } from '@/lib/recommendations/analytics';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Get personalized recommendations
    const recommendations = await getHybridRecommendations(session.user.id, limit);

    // Store recommendations for tracking
    await storeRecommendations(session.user.id, recommendations);

    // Get project details for each recommendation
    const projectIds = recommendations
      .filter((r) => r.entityType === 'project')
      .map((r) => r.entityId);

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        fundingGoal: true,
        fundingRaised: true,
        status: true,
        imageUrl: true,
        location: true,
        communities: {
          include: {
            community: { select: { name: true, slug: true } },
          },
        },
        _count: {
          select: { allocations: true },
        },
      },
    });

    const projectMap = new Map(projects.map((p) => [p.id, p]));

    // Mark as shown and log metrics
    for (const rec of recommendations) {
      await trackRecommendationShown(session.user.id, rec.entityType, rec.entityId);
      await logRecommendationEvent('impression', 'hybrid', rec.entityType);
    }

    const results = recommendations.map((rec) => {
      const project = projectMap.get(rec.entityId);
      return {
        id: rec.entityId,
        type: rec.entityType,
        score: rec.score,
        reason: rec.reason,
        project: project
          ? {
              ...project,
              progress: Math.round((project.fundingRaised / project.fundingGoal) * 100),
              backerCount: project._count.allocations,
              communities: project.communities.map((c) => c.community),
            }
          : null,
      };
    });

    return NextResponse.json({
      recommendations: results.filter((r) => r.project !== null),
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
