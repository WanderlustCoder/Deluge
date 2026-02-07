// Rate limiting for API requests

import { prisma } from '@/lib/prisma';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

// In-memory rate limit store (for development)
// In production, use Redis
const rateLimitStore = new Map<string, { count: number; resetAt: Date }>();

// Check and update rate limit
export async function checkRateLimit(
  apiKeyId: string,
  rateLimit: number
): Promise<RateLimitResult> {
  const windowMs = 60 * 60 * 1000; // 1 hour window
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const key = `rate:${apiKeyId}`;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: rateLimit,
      remaining: rateLimit - 1,
      resetAt,
    };
  }

  if (existing.count >= rateLimit) {
    return {
      allowed: false,
      limit: rateLimit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count++;
  return {
    allowed: true,
    limit: rateLimit,
    remaining: rateLimit - existing.count,
    resetAt: existing.resetAt,
  };
}

// Get current rate limit status without incrementing
export function getRateLimitStatus(
  apiKeyId: string,
  rateLimit: number
): RateLimitResult {
  const now = new Date();
  const key = `rate:${apiKeyId}`;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt < now) {
    return {
      allowed: true,
      limit: rateLimit,
      remaining: rateLimit,
      resetAt: new Date(now.getTime() + 60 * 60 * 1000),
    };
  }

  return {
    allowed: existing.count < rateLimit,
    limit: rateLimit,
    remaining: Math.max(0, rateLimit - existing.count),
    resetAt: existing.resetAt,
  };
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());
}

// Clean up expired entries (call periodically)
export function cleanupRateLimits(): void {
  const now = new Date();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Get usage stats for an API key over time
export async function getApiKeyUsageHistory(
  apiKeyId: string,
  days: number = 7
): Promise<{ date: string; count: number }[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const logs = await prisma.apiRequestLog.groupBy({
    by: ['createdAt'],
    where: {
      apiKeyId,
      createdAt: { gte: since },
    },
    _count: { id: true },
  });

  // Group by date
  const byDate = new Map<string, number>();
  for (const log of logs) {
    const date = log.createdAt.toISOString().split('T')[0];
    byDate.set(date, (byDate.get(date) || 0) + log._count.id);
  }

  // Fill in missing dates
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    result.push({
      date,
      count: byDate.get(date) || 0,
    });
  }

  return result;
}
