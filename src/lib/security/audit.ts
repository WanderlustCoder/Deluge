import { prisma } from '@/lib/prisma';

export type AuditAction = 'create' | 'read' | 'update' | 'delete';
export type EventSeverity = 'info' | 'warning' | 'critical';

// Log a security audit entry
export async function logSecurityAudit(data: {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.securityAuditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      previousState: data.previousState ? JSON.stringify(data.previousState) : null,
      newState: data.newState ? JSON.stringify(data.newState) : null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
}

// Log a security event
export async function logSecurityEvent(data: {
  userId?: string;
  eventType: string;
  severity?: EventSeverity;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.securityEvent.create({
    data: {
      userId: data.userId,
      eventType: data.eventType,
      severity: data.severity ?? 'info',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
}

// Get audit logs for an entity
export async function getEntityAuditLogs(entityType: string, entityId: string) {
  return prisma.securityAuditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

// Get user's security events
export async function getUserSecurityEvents(userId: string, limit: number = 50) {
  return prisma.securityEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Get recent security events (admin view)
export async function getRecentSecurityEvents(options?: {
  severity?: EventSeverity;
  eventType?: string;
  limit?: number;
}) {
  return prisma.securityEvent.findMany({
    where: {
      severity: options?.severity,
      eventType: options?.eventType,
    },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

// Get security audit summary
export async function getSecuritySummary(timeWindowHours: number = 24) {
  const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

  const [events, suspiciousActivities] = await Promise.all([
    prisma.securityEvent.groupBy({
      by: ['eventType', 'severity'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
    prisma.suspiciousActivity.count({
      where: { createdAt: { gte: since }, status: 'pending' },
    }),
  ]);

  const eventsByType: Record<string, number> = {};
  const eventsBySeverity: Record<string, number> = {};

  for (const event of events) {
    eventsByType[event.eventType] = (eventsByType[event.eventType] ?? 0) + event._count;
    eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] ?? 0) + event._count;
  }

  return {
    timeWindowHours,
    eventsByType,
    eventsBySeverity,
    pendingSuspiciousActivities: suspiciousActivities,
    totalEvents: Object.values(eventsByType).reduce((a, b) => a + b, 0),
  };
}

// Search audit logs
export async function searchAuditLogs(options: {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  return prisma.securityAuditLog.findMany({
    where: {
      userId: options.userId,
      action: options.action,
      entityType: options.entityType,
      createdAt: {
        gte: options.startDate,
        lte: options.endDate,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 100,
    skip: options.offset ?? 0,
  });
}

// High-level audit functions for common operations
export async function auditUserUpdate(
  userId: string,
  targetUserId: string,
  previousState: Record<string, unknown>,
  newState: Record<string, unknown>,
  ipAddress?: string
) {
  return logSecurityAudit({
    userId,
    action: 'update',
    entityType: 'user',
    entityId: targetUserId,
    previousState,
    newState,
    ipAddress,
  });
}

export async function auditLogin(
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  return logSecurityEvent({
    userId: success ? userId : undefined,
    eventType: success ? 'login_success' : 'login_failed',
    severity: success ? 'info' : 'warning',
    ipAddress,
    userAgent,
    metadata: { attemptedUserId: userId },
  });
}

export async function auditPasswordChange(userId: string, ipAddress?: string) {
  return logSecurityEvent({
    userId,
    eventType: 'password_change',
    severity: 'warning',
    ipAddress,
  });
}

export async function auditDataExport(userId: string, ipAddress?: string) {
  return logSecurityEvent({
    userId,
    eventType: 'data_export',
    severity: 'info',
    ipAddress,
  });
}

export async function auditAccountDeletion(userId: string, ipAddress?: string) {
  return logSecurityEvent({
    userId,
    eventType: 'account_deletion_requested',
    severity: 'warning',
    ipAddress,
  });
}
