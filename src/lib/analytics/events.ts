import { prisma } from '@/lib/prisma';

export type EventType = 'page_view' | 'action' | 'conversion' | 'error';

export interface TrackEventInput {
  eventType: EventType;
  eventName: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  context?: {
    device?: string;
    browser?: string;
    os?: string;
    location?: string;
    referrer?: string;
    userAgent?: string;
  };
}

// Track an analytics event
export async function trackEvent(input: TrackEventInput) {
  const event = await prisma.analyticsEvent.create({
    data: {
      eventType: input.eventType,
      eventName: input.eventName,
      userId: input.userId,
      sessionId: input.sessionId,
      properties: input.properties ? JSON.stringify(input.properties) : null,
      context: input.context ? JSON.stringify(input.context) : null,
    },
  });

  return event;
}

// Get events by user
export async function getUserEvents(
  userId: string,
  options?: {
    eventType?: EventType;
    eventName?: string;
    limit?: number;
    offset?: number;
    from?: Date;
    to?: Date;
  }
) {
  const { eventType, eventName, limit = 100, offset = 0, from, to } = options || {};

  const where: Record<string, unknown> = { userId };
  if (eventType) where.eventType = eventType;
  if (eventName) where.eventName = eventName;
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, Date>).gte = from;
    if (to) (where.timestamp as Record<string, Date>).lte = to;
  }

  return prisma.analyticsEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    skip: offset,
    take: limit,
  });
}

// Get event counts by name
export async function getEventCounts(
  options?: {
    eventType?: EventType;
    from?: Date;
    to?: Date;
  }
) {
  const { eventType, from, to } = options || {};

  const where: Record<string, unknown> = {};
  if (eventType) where.eventType = eventType;
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, Date>).gte = from;
    if (to) (where.timestamp as Record<string, Date>).lte = to;
  }

  const counts = await prisma.analyticsEvent.groupBy({
    by: ['eventName'],
    where,
    _count: true,
  });

  return counts.map((c) => ({
    eventName: c.eventName,
    count: c._count,
  }));
}

// Get daily event counts
export async function getDailyEventCounts(
  eventName: string,
  days: number = 30
) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      eventName,
      timestamp: { gte: from },
    },
    select: { timestamp: true },
  });

  // Group by day
  const dailyCounts = new Map<string, number>();
  for (let i = 0; i <= days; i++) {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    dailyCounts.set(date.toISOString().split('T')[0], 0);
  }

  events.forEach((event) => {
    const day = event.timestamp.toISOString().split('T')[0];
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  });

  return Array.from(dailyCounts.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

// Common event tracking helpers
export async function trackPageView(userId: string | undefined, path: string, sessionId?: string) {
  return trackEvent({
    eventType: 'page_view',
    eventName: 'page_view',
    userId,
    sessionId,
    properties: { path },
  });
}

export async function trackAction(
  userId: string,
  action: string,
  properties?: Record<string, unknown>
) {
  return trackEvent({
    eventType: 'action',
    eventName: action,
    userId,
    properties,
  });
}

export async function trackConversion(
  userId: string,
  conversionName: string,
  value?: number,
  properties?: Record<string, unknown>
) {
  return trackEvent({
    eventType: 'conversion',
    eventName: conversionName,
    userId,
    properties: { ...properties, value },
  });
}

export async function trackError(
  errorName: string,
  error: string,
  userId?: string,
  properties?: Record<string, unknown>
) {
  return trackEvent({
    eventType: 'error',
    eventName: errorName,
    userId,
    properties: { error, ...properties },
  });
}
