// GET /api/v1/stats - Platform statistics (public API)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiRequest, apiResponse, apiError, logApiResponse, withCors } from '@/lib/api/auth';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/api/rate-limiter';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Authenticate
  const { context, error } = await authenticateApiRequest(request, 'read');
  if (error) return withCors(error);

  // Check rate limit
  const rateLimit = await checkRateLimit(context!.apiKey.id, context!.apiKey.rateLimit);
  if (!rateLimit.allowed) {
    const response = apiError('Rate limit exceeded', 429);
    addRateLimitHeaders(response.headers, rateLimit);
    return withCors(response);
  }

  try {
    const [
      projectStats,
      communityStats,
      fundingStats,
      userStats,
    ] = await Promise.all([
      // Project stats
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Community stats
      prisma.community.count(),
      // Funding stats
      prisma.allocation.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
      // User stats
      prisma.user.count(),
    ]);

    const projectsByStatus: Record<string, number> = {};
    for (const p of projectStats) {
      projectsByStatus[p.status] = p._count.id;
    }

    const response = apiResponse({
      projects: {
        total: Object.values(projectsByStatus).reduce((a, b) => a + b, 0),
        active: projectsByStatus['active'] || 0,
        funded: projectsByStatus['funded'] || 0,
        completed: projectsByStatus['completed'] || 0,
      },
      communities: {
        total: communityStats,
      },
      funding: {
        totalRaised: fundingStats._sum.amount || 0,
        totalContributions: fundingStats._count.id,
      },
      users: {
        total: userStats,
      },
      generatedAt: new Date().toISOString(),
    });

    addRateLimitHeaders(response.headers, rateLimit);
    await logApiResponse(context!.apiKey.id, request, 200, startTime);
    return withCors(response);
  } catch (err) {
    console.error('API error:', err);
    await logApiResponse(context!.apiKey.id, request, 500, startTime);
    return withCors(apiError('Internal server error', 500));
  }
}

export async function OPTIONS() {
  return withCors(NextResponse.json(null, { status: 204 }));
}
