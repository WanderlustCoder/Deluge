// GET /api/v1/projects/[id] - Get project details (public API)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateApiRequest, apiResponse, apiError, logApiResponse, withCors } from '@/lib/api/auth';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/api/rate-limiter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id } = await params;

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
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        communities: {
          include: {
            community: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: { allocations: true },
        },
      },
    });

    if (!project) {
      await logApiResponse(context!.apiKey.id, request, 404, startTime);
      return withCors(apiError('Project not found', 404));
    }

    const response = apiResponse({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      fundingGoal: project.fundingGoal,
      fundingRaised: project.fundingRaised,
      status: project.status,
      imageUrl: project.imageUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      progress: Math.round((project.fundingRaised / project.fundingGoal) * 100),
      backerCount: project._count.allocations,
      communities: project.communities.map((cp) => cp.community),
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
