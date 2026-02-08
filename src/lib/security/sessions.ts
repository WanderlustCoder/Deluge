import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

// Generate session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Parse user agent to determine device type
function parseDeviceType(userAgent?: string): DeviceType {
  if (!userAgent) return 'desktop';

  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}

// Create a new security session
export async function createSecuritySession(
  userId: string,
  options?: {
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  }
) {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry

  const session = await prisma.securitySession.create({
    data: {
      userId,
      token,
      deviceName: options?.deviceName,
      deviceType: parseDeviceType(options?.userAgent),
      ipAddress: options?.ipAddress,
      location: options?.location,
      expiresAt,
    },
  });

  // Log security event
  await prisma.securityEvent.create({
    data: {
      userId,
      eventType: 'session_created',
      severity: 'info',
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      location: options?.location,
    },
  });

  return session;
}

// Validate session token
export async function validateSession(token: string) {
  const session = await prisma.securitySession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.isRevoked) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    return null;
  }

  // Update last active
  await prisma.securitySession.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  return session;
}

// Get user's active sessions
export async function getUserSessions(userId: string) {
  return prisma.securitySession.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: 'desc' },
    select: {
      id: true,
      deviceName: true,
      deviceType: true,
      ipAddress: true,
      location: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });
}

// Revoke a specific session
export async function revokeSession(sessionId: string, userId: string) {
  const session = await prisma.securitySession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  await prisma.securitySession.update({
    where: { id: sessionId },
    data: { isRevoked: true },
  });

  await prisma.securityEvent.create({
    data: {
      userId,
      eventType: 'session_revoked',
      severity: 'info',
      metadata: JSON.stringify({ sessionId }),
    },
  });
}

// Revoke all sessions except current
export async function revokeAllOtherSessions(
  userId: string,
  currentSessionId: string
) {
  const result = await prisma.securitySession.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      isRevoked: false,
    },
    data: { isRevoked: true },
  });

  await prisma.securityEvent.create({
    data: {
      userId,
      eventType: 'all_sessions_revoked',
      severity: 'warning',
      metadata: JSON.stringify({ excludedSession: currentSessionId, count: result.count }),
    },
  });

  return result.count;
}

// Revoke all sessions (password change, etc.)
export async function revokeAllSessions(userId: string) {
  const result = await prisma.securitySession.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  await prisma.securityEvent.create({
    data: {
      userId,
      eventType: 'all_sessions_revoked',
      severity: 'warning',
      metadata: JSON.stringify({ count: result.count }),
    },
  });

  return result.count;
}

// Clean up expired sessions
export async function cleanupExpiredSessions() {
  const result = await prisma.securitySession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true },
      ],
    },
  });

  return result.count;
}

// Check for suspicious session activity
export async function checkSuspiciousActivity(
  userId: string,
  newIpAddress: string,
  newLocation?: string
): Promise<boolean> {
  const recentSessions = await prisma.securitySession.findMany({
    where: {
      userId,
      createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    },
    select: { ipAddress: true, location: true },
  });

  // Flag if logging in from a new location
  const knownIPs = new Set(recentSessions.map((s) => s.ipAddress));

  if (recentSessions.length > 0 && !knownIPs.has(newIpAddress)) {
    await prisma.suspiciousActivity.create({
      data: {
        userId,
        type: 'location',
        severity: 'low',
        description: 'Login from new IP address',
        indicators: JSON.stringify({
          newIp: newIpAddress,
          newLocation,
          knownIPs: Array.from(knownIPs),
        }),
      },
    });
    return true;
  }

  return false;
}
