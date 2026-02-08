// GET /api/discover/nearby - Location-based recommendations

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLocationRecommendations } from '@/lib/recommendations/content-based';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const radius = parseInt(searchParams.get('radius') || '50');

    // Get location-based recommendations
    const recommendations = await getLocationRecommendations(
      session.user.id,
      radius,
      limit
    );

    // Get project details
    const projectIds = recommendations.map((r) => r.projectId);

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

    const results = recommendations.map((rec) => {
      const project = projectMap.get(rec.projectId);
      return {
        id: rec.projectId,
        score: rec.score,
        distance: rec.distance,
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
    console.error('Error getting nearby recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
