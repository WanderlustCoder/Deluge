import { prisma } from '@/lib/prisma';

export type FraudType = 'velocity' | 'location' | 'device' | 'pattern';
export type FraudSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FraudStatus = 'pending' | 'reviewed' | 'false_positive' | 'confirmed';

// Flag suspicious activity
export async function flagSuspiciousActivity(data: {
  userId?: string;
  type: FraudType;
  severity: FraudSeverity;
  description: string;
  indicators: Record<string, unknown>;
}) {
  return prisma.suspiciousActivity.create({
    data: {
      userId: data.userId,
      type: data.type,
      severity: data.severity,
      description: data.description,
      indicators: JSON.stringify(data.indicators),
    },
  });
}

// Check for velocity-based fraud (too many actions too fast)
export async function checkVelocity(
  userId: string,
  actionType: string,
  threshold: { count: number; windowMinutes: number }
): Promise<boolean> {
  const since = new Date(Date.now() - threshold.windowMinutes * 60 * 1000);

  // Check recent actions (simplified - would need specific tables per action type)
  let count = 0;

  if (actionType === 'login') {
    count = await prisma.securityEvent.count({
      where: {
        userId,
        eventType: { in: ['login_success', 'login_failed'] },
        createdAt: { gte: since },
      },
    });
  } else if (actionType === 'fund') {
    count = await prisma.allocation.count({
      where: {
        userId,
        createdAt: { gte: since },
      },
    });
  } else if (actionType === 'data_request') {
    count = await prisma.dataRequest.count({
      where: {
        userId,
        requestedAt: { gte: since },
      },
    });
  }

  if (count >= threshold.count) {
    await flagSuspiciousActivity({
      userId,
      type: 'velocity',
      severity: count >= threshold.count * 2 ? 'high' : 'medium',
      description: `High ${actionType} velocity: ${count} in ${threshold.windowMinutes} minutes`,
      indicators: {
        actionType,
        count,
        windowMinutes: threshold.windowMinutes,
        threshold: threshold.count,
      },
    });
    return true;
  }

  return false;
}

// Check for suspicious login patterns
export async function checkLoginPatterns(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<boolean> {
  const recentLogins = await prisma.securityEvent.findMany({
    where: {
      userId,
      eventType: 'login_success',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (recentLogins.length < 2) return false;

  // Check for unusual patterns
  const uniqueIPs = new Set(recentLogins.map((l) => l.ipAddress));
  const uniqueAgents = new Set(recentLogins.map((l) => l.userAgent));

  // Flag if many different IPs or devices in short time
  if (uniqueIPs.size >= 5 || uniqueAgents.size >= 5) {
    await flagSuspiciousActivity({
      userId,
      type: 'pattern',
      severity: 'medium',
      description: 'Multiple devices/locations in 24 hours',
      indicators: {
        uniqueIPs: Array.from(uniqueIPs),
        uniqueAgents: uniqueAgents.size,
        loginCount: recentLogins.length,
      },
    });
    return true;
  }

  return false;
}

// Get pending suspicious activities
export async function getPendingSuspiciousActivities(options?: {
  severity?: FraudSeverity;
  type?: FraudType;
  limit?: number;
}) {
  return prisma.suspiciousActivity.findMany({
    where: {
      status: 'pending',
      severity: options?.severity,
      type: options?.type,
    },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'asc' },
    ],
    take: options?.limit ?? 50,
  });
}

// Review suspicious activity
export async function reviewSuspiciousActivity(
  activityId: string,
  reviewedBy: string,
  status: 'false_positive' | 'confirmed'
) {
  return prisma.suspiciousActivity.update({
    where: { id: activityId },
    data: {
      status,
      reviewedBy,
      reviewedAt: new Date(),
    },
  });
}

// Get fraud summary for dashboard
export async function getFraudSummary() {
  const [pending, bySeverity, byType] = await Promise.all([
    prisma.suspiciousActivity.count({
      where: { status: 'pending' },
    }),
    prisma.suspiciousActivity.groupBy({
      by: ['severity'],
      where: { status: 'pending' },
      _count: true,
    }),
    prisma.suspiciousActivity.groupBy({
      by: ['type'],
      where: { status: 'pending' },
      _count: true,
    }),
  ]);

  return {
    pendingCount: pending,
    bySeverity: Object.fromEntries(bySeverity.map((s) => [s.severity, s._count])),
    byType: Object.fromEntries(byType.map((t) => [t.type, t._count])),
  };
}

// Rate limiting check
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  limit: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

  // Try to find existing rate limit entry
  const existing = await prisma.rateLimit.findFirst({
    where: {
      identifier,
      endpoint,
      windowEnd: { gt: now },
    },
    orderBy: { windowStart: 'desc' },
  });

  if (existing) {
    if (existing.isBlocked && existing.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.blockedUntil,
      };
    }

    if (existing.count >= limit) {
      // Block for double the window
      const blockedUntil = new Date(now.getTime() + windowMinutes * 2 * 60 * 1000);
      await prisma.rateLimit.update({
        where: { id: existing.id },
        data: {
          isBlocked: true,
          blockedUntil,
        },
      });

      return {
        allowed: false,
        remaining: 0,
        resetAt: blockedUntil,
      };
    }

    // Increment count
    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      remaining: limit - existing.count - 1,
      resetAt: existing.windowEnd,
    };
  }

  // Create new rate limit entry
  await prisma.rateLimit.create({
    data: {
      identifier,
      endpoint,
      count: 1,
      windowStart,
      windowEnd,
    },
  });

  return {
    allowed: true,
    remaining: limit - 1,
    resetAt: windowEnd,
  };
}

// Clean up old rate limit entries
export async function cleanupRateLimits() {
  const result = await prisma.rateLimit.deleteMany({
    where: {
      windowEnd: { lt: new Date() },
    },
  });
  return result.count;
}
