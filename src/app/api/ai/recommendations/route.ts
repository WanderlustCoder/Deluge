/**
 * AI Recommendations API
 * Plan 28: AI-Powered Platform Features
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getRecommendations,
  getSimilarProjects,
  getTrendingProjects,
} from '@/lib/ai/recommendations';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'personalized';
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const excludeIds = searchParams.get('exclude')?.split(',').filter(Boolean) || [];

    let projects;

    switch (type) {
      case 'similar':
        if (!projectId) {
          return NextResponse.json(
            { error: 'projectId required for similar recommendations' },
            { status: 400 }
          );
        }
        projects = await getSimilarProjects(projectId, limit);
        break;

      case 'trending':
        projects = await getTrendingProjects(limit);
        break;

      case 'personalized':
      default:
        projects = await getRecommendations({
          userId: session.user.id,
          limit,
          excludeIds,
        });
        break;
    }

    return NextResponse.json({ projects, type });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
