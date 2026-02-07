// GET /api/v1/communities - List communities (public API)

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
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          type: true,
          imageUrl: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.community.count({ where }),
    ]);

    const response = apiResponse({
      communities: communities.map((c) => ({
        ...c,
        memberCount: c._count.members,
        projectCount: c._count.projects,
        _count: undefined,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + communities.length < total,
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
