import { prisma } from '@/lib/prisma';

export type EventType = 'meetup' | 'workshop' | 'welcome_session' | 'info_session';

export const EVENT_TYPES: { value: EventType; label: string; description: string }[] = [
  { value: 'meetup', label: 'Community Meetup', description: 'Casual gathering for community members' },
  { value: 'workshop', label: 'Workshop', description: 'Hands-on learning session' },
  { value: 'welcome_session', label: 'Welcome Session', description: 'Introduction for new members' },
  { value: 'info_session', label: 'Info Session', description: 'Learn about Deluge' },
];

// Create an advocate event
export async function createEvent(
  advocateId: string,
  data: {
    title: string;
    description: string;
    type: EventType;
    date: Date;
    endDate?: Date;
    location?: string;
    isVirtual?: boolean;
    virtualLink?: string;
    communityId?: string;
  }
) {
  // Verify advocate
  const advocate = await prisma.communityAdvocate.findUnique({
    where: { id: advocateId },
    select: { status: true },
  });

  if (!advocate || advocate.status !== 'active') {
    throw new Error('Not an active advocate');
  }

  return prisma.advocateEvent.create({
    data: {
      advocateId,
      title: data.title,
      description: data.description,
      type: data.type,
      date: data.date,
      endDate: data.endDate,
      location: data.location,
      isVirtual: data.isVirtual ?? false,
      virtualLink: data.virtualLink,
      communityId: data.communityId,
    },
  });
}

// Update an event
export async function updateEvent(
  eventId: string,
  advocateId: string,
  data: {
    title?: string;
    description?: string;
    type?: EventType;
    date?: Date;
    endDate?: Date;
    location?: string;
    isVirtual?: boolean;
    virtualLink?: string;
    recap?: string;
  }
) {
  // Verify ownership
  const event = await prisma.advocateEvent.findUnique({
    where: { id: eventId },
    select: { advocateId: true },
  });

  if (!event || event.advocateId !== advocateId) {
    throw new Error('Event not found or not authorized');
  }

  return prisma.advocateEvent.update({
    where: { id: eventId },
    data,
  });
}

// Get event by ID
export async function getEvent(eventId: string) {
  return prisma.advocateEvent.findUnique({
    where: { id: eventId },
    include: {
      advocate: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      rsvps: {
        select: {
          id: true,
          userId: true,
          name: true,
          attended: true,
        },
      },
    },
  });
}

// List upcoming events
export async function listUpcomingEvents(options?: {
  advocateId?: string;
  communityId?: string;
  type?: EventType;
  limit?: number;
}) {
  const { advocateId, communityId, type, limit = 20 } = options || {};

  const where: Record<string, unknown> = {
    date: { gte: new Date() },
  };
  if (advocateId) where.advocateId = advocateId;
  if (communityId) where.communityId = communityId;
  if (type) where.type = type;

  return prisma.advocateEvent.findMany({
    where,
    include: {
      advocate: {
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: 'asc' },
    take: limit,
  });
}

// List past events
export async function listPastEvents(options?: {
  advocateId?: string;
  limit?: number;
}) {
  const { advocateId, limit = 20 } = options || {};

  const where: Record<string, unknown> = {
    date: { lt: new Date() },
  };
  if (advocateId) where.advocateId = advocateId;

  return prisma.advocateEvent.findMany({
    where,
    include: {
      advocate: {
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

// RSVP to an event
export async function rsvpToEvent(
  eventId: string,
  data: {
    userId?: string;
    email?: string;
    name?: string;
  }
) {
  if (!data.userId && !data.email) {
    throw new Error('Either userId or email is required');
  }

  // Check for existing RSVP
  if (data.userId) {
    const existing = await prisma.advocateEventRSVP.findUnique({
      where: {
        eventId_userId: { eventId, userId: data.userId },
      },
    });
    if (existing) {
      throw new Error('Already RSVP\'d to this event');
    }
  }

  return prisma.advocateEventRSVP.create({
    data: {
      eventId,
      userId: data.userId,
      email: data.email,
      name: data.name,
    },
  });
}

// Cancel RSVP
export async function cancelRsvp(eventId: string, userId: string) {
  return prisma.advocateEventRSVP.deleteMany({
    where: { eventId, userId },
  });
}

// Mark attendance
export async function markAttendance(rsvpId: string, attended: boolean) {
  return prisma.advocateEventRSVP.update({
    where: { id: rsvpId },
    data: { attended },
  });
}

// Get advocate's events
export async function getAdvocateEvents(advocateId: string) {
  const [upcoming, past] = await Promise.all([
    prisma.advocateEvent.findMany({
      where: { advocateId, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      include: { _count: { select: { rsvps: true } } },
    }),
    prisma.advocateEvent.findMany({
      where: { advocateId, date: { lt: new Date() } },
      orderBy: { date: 'desc' },
      take: 10,
      include: { _count: { select: { rsvps: true } } },
    }),
  ]);

  return { upcoming, past };
}
