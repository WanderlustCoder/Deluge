// GET /api/v1/projects - List projects (public API)

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
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'active';
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = { status };
    if (category) where.category = category;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          fundingGoal: true,
          fundingRaised: true,
          status: true,
          imageUrl: true,
          createdAt: true,
          _count: {
            select: { allocations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.project.count({ where }),
    ]);

    const response = apiResponse({
      projects: projects.map((p) => ({
        ...p,
        progress: Math.round((p.fundingRaised / p.fundingGoal) * 100),
        backerCount: p._count.allocations,
        _count: undefined,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + projects.length < total,
      },
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
