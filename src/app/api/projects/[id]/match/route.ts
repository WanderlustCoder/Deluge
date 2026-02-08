// GET /api/projects/[id]/match - Get match score for user and project

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { calculateMatchScore, getCachedMatchScore, storeMatchScore } from '@/lib/recommendations/matching';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check for cached result first
    let result = await getCachedMatchScore(session.user.id, id);

    if (!result) {
      // Calculate fresh match score
      result = await calculateMatchScore(session.user.id, id);

      // Cache the result
      await storeMatchScore(session.user.id, id, result);
    }

    return NextResponse.json({
      score: Math.round(result.score * 100),
      breakdown: {
        category: Math.round(result.breakdown.category * 100),
        community: Math.round(result.breakdown.community * 100),
        history: Math.round(result.breakdown.history * 100),
        location: Math.round(result.breakdown.location * 100),
        timing: Math.round(result.breakdown.timing * 100),
      },
      highlights: result.highlights,
      matchLevel: getMatchLevel(result.score),
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    return NextResponse.json({ error: 'Failed to calculate match' }, { status: 500 });
  }
}

function getMatchLevel(score: number): 'low' | 'medium' | 'high' | 'excellent' {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}
