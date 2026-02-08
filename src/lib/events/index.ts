/**
 * Fundraising Events Core
 * Plan 30: Fundraising Events & Ticketing
 */

import { prisma } from '@/lib/prisma';

export type EventType = 'gala' | 'auction' | '5k' | 'concert' | 'dinner' | 'festival' | 'virtual';
export type EventFormat = 'in_person' | 'virtual' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled';

export interface CreateEventInput {
  communityId: string;
  organizerId: string;
  projectId?: string;
  title: string;
  description: string;
  type: EventType;
  format?: EventFormat;
  startDate: Date;
  endDate: Date;
  timezone?: string;
  venue?: string;
  address?: string;
  virtualUrl?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  goalAmount?: number;
  ticketingEnabled?: boolean;
  donationsEnabled?: boolean;
  registrationRequired?: boolean;
  capacity?: number;
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

/**
 * Create a new fundraising event
 */
export async function createEvent(input: CreateEventInput): Promise<{ id: string; slug: string }> {
  const slug = generateSlug(input.title);

  const event = await prisma.fundraisingEvent.create({
    data: {
      communityId: input.communityId,
      organizerId: input.organizerId,
      projectId: input.projectId,
      title: input.title,
      slug,
      description: input.description,
      type: input.type,
      format: input.format || 'in_person',
      startDate: input.startDate,
      endDate: input.endDate,
      timezone: input.timezone || 'America/Los_Angeles',
      venue: input.venue,
      address: input.address,
      virtualUrl: input.virtualUrl,
      imageUrl: input.imageUrl,
      coverImageUrl: input.coverImageUrl,
      goalAmount: input.goalAmount,
      ticketingEnabled: input.ticketingEnabled ?? true,
      donationsEnabled: input.donationsEnabled ?? true,
      registrationRequired: input.registrationRequired ?? true,
      capacity: input.capacity,
      status: 'draft',
    },
    select: { id: true, slug: true },
  });

  return event;
}

/**
 * Get event by slug
 */
export async function getEventBySlug(slug: string) {
  const event = await prisma.fundraisingEvent.findUnique({
    where: { slug },
    include: {
      community: { select: { id: true, name: true, slug: true } },
      tickets: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
      sponsors: {
        where: { status: 'confirmed' },
        orderBy: { tier: 'asc' },
      },
      matches: {
        where: { isActive: true },
      },
      _count: {
        select: {
          registrations: { where: { status: 'confirmed' } },
          donations: { where: { paymentStatus: 'completed' } },
          participants: true,
        },
      },
    },
  });

  if (!event) return null;

  return {
    ...event,
    tickets: event.tickets.map((t) => ({
      ...t,
      includedItems: JSON.parse(t.includedItems || '[]'),
      available: t.quantity ? t.quantity - t.sold - t.reserved : null,
    })),
    sponsors: event.sponsors.map((s) => ({
      ...s,
      benefits: JSON.parse(s.benefits || '[]'),
    })),
  };
}

/**
 * Update event
 */
export async function updateEvent(
  id: string,
  organizerId: string,
  data: Partial<CreateEventInput> & { status?: EventStatus }
): Promise<boolean> {
  const result = await prisma.fundraisingEvent.updateMany({
    where: { id, organizerId },
    data: {
      ...data,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    },
  });

  return result.count > 0;
}

/**
 * Publish an event
 */
export async function publishEvent(id: string, organizerId: string): Promise<boolean> {
  const result = await prisma.fundraisingEvent.updateMany({
    where: { id, organizerId, status: 'draft' },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  });

  return result.count > 0;
}

/**
 * Browse events
 */
export async function browseEvents(options: {
  communityId?: string;
  type?: EventType;
  format?: EventFormat;
  status?: EventStatus;
  upcoming?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  events: Array<{
    id: string;
    slug: string;
    title: string;
    type: string;
    format: string;
    startDate: Date;
    endDate: Date;
    venue: string | null;
    imageUrl: string | null;
    goalAmount: number | null;
    raisedAmount: number;
    status: string;
    community: { id: string; name: string };
    attendeeCount: number;
  }>;
  total: number;
}> {
  const where: Record<string, unknown> = {};

  if (options.communityId) where.communityId = options.communityId;
  if (options.type) where.type = options.type;
  if (options.format) where.format = options.format;
  if (options.status) {
    where.status = options.status;
  } else {
    where.status = { in: ['published', 'live'] };
  }

  if (options.upcoming) {
    where.startDate = { gte: new Date() };
  }

  if (options.search) {
    where.OR = [
      { title: { contains: options.search } },
      { description: { contains: options.search } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.fundraisingEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: options.limit || 20,
      skip: options.offset || 0,
      include: {
        community: { select: { id: true, name: true } },
      },
    }),
    prisma.fundraisingEvent.count({ where }),
  ]);

  return {
    events: events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      type: e.type,
      format: e.format,
      startDate: e.startDate,
      endDate: e.endDate,
      venue: e.venue,
      imageUrl: e.imageUrl,
      goalAmount: e.goalAmount,
      raisedAmount: e.raisedAmount,
      status: e.status,
      community: e.community,
      attendeeCount: e.attendeeCount,
    })),
    total,
  };
}

/**
 * Get events organized by user
 */
export async function getUserEvents(
  userId: string,
  status?: EventStatus
): Promise<
  Array<{
    id: string;
    slug: string;
    title: string;
    startDate: Date;
    status: string;
    raisedAmount: number;
    attendeeCount: number;
  }>
> {
  return prisma.fundraisingEvent.findMany({
    where: {
      organizerId: userId,
      status: status || undefined,
    },
    orderBy: { startDate: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      startDate: true,
      status: true,
      raisedAmount: true,
      attendeeCount: true,
    },
  });
}

/**
 * Update event totals
 */
export async function updateEventTotals(eventId: string): Promise<void> {
  const [registrations, donations] = await Promise.all([
    prisma.eventRegistration.aggregate({
      where: { eventId, status: 'confirmed' },
      _count: true,
      _sum: { donationAmount: true },
    }),
    prisma.eventDonation.aggregate({
      where: { eventId, paymentStatus: 'completed' },
      _sum: { amount: true, matchedAmount: true },
    }),
  ]);

  const ticketDonations = registrations._sum.donationAmount || 0;
  const directDonations = donations._sum.amount || 0;
  const matchedDonations = donations._sum.matchedAmount || 0;
  const totalRaised = ticketDonations + directDonations + matchedDonations;

  await prisma.fundraisingEvent.update({
    where: { id: eventId },
    data: {
      raisedAmount: totalRaised,
      attendeeCount: registrations._count,
    },
  });
}

/**
 * Get event stats
 */
export async function getEventStats(eventId: string): Promise<{
  totalRaised: number;
  ticketRevenue: number;
  donationRevenue: number;
  matchedAmount: number;
  attendeeCount: number;
  ticketsSold: number;
  donorCount: number;
  participantCount: number;
  progress: number;
}> {
  const [event, registrations, donations, tickets, participants] = await Promise.all([
    prisma.fundraisingEvent.findUnique({
      where: { id: eventId },
      select: { goalAmount: true, raisedAmount: true, attendeeCount: true },
    }),
    prisma.eventRegistration.aggregate({
      where: { eventId, status: 'confirmed' },
      _sum: { totalAmount: true, donationAmount: true },
    }),
    prisma.eventDonation.aggregate({
      where: { eventId, paymentStatus: 'completed' },
      _count: true,
      _sum: { amount: true, matchedAmount: true },
    }),
    prisma.eventTicket.count({
      where: { registration: { eventId }, status: 'valid' },
    }),
    prisma.eventParticipant.count({ where: { eventId } }),
  ]);

  const ticketRevenue = (registrations._sum.totalAmount || 0) - (registrations._sum.donationAmount || 0);
  const donationRevenue = (registrations._sum.donationAmount || 0) + (donations._sum.amount || 0);
  const matchedAmount = donations._sum.matchedAmount || 0;
  const totalRaised = event?.raisedAmount || 0;
  const progress = event?.goalAmount ? Math.min((totalRaised / event.goalAmount) * 100, 100) : 0;

  return {
    totalRaised,
    ticketRevenue,
    donationRevenue,
    matchedAmount,
    attendeeCount: event?.attendeeCount || 0,
    ticketsSold: tickets,
    donorCount: donations._count,
    participantCount: participants,
    progress,
  };
}
