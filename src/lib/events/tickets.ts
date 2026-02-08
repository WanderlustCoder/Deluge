/**
 * Event Tickets Management
 * Plan 30: Fundraising Events & Ticketing
 */

import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export interface CreateTicketTypeInput {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  maxPerOrder?: number;
  salesStart?: Date;
  salesEnd?: Date;
  includedItems?: string[];
  order?: number;
}

/**
 * Create a ticket type for an event
 */
export async function createTicketType(
  input: CreateTicketTypeInput
): Promise<{ id: string }> {
  const ticketType = await prisma.eventTicketType.create({
    data: {
      eventId: input.eventId,
      name: input.name,
      description: input.description,
      price: input.price,
      quantity: input.quantity,
      maxPerOrder: input.maxPerOrder || 10,
      salesStart: input.salesStart,
      salesEnd: input.salesEnd,
      includedItems: JSON.stringify(input.includedItems || []),
      order: input.order || 0,
    },
    select: { id: true },
  });

  return ticketType;
}

/**
 * Update a ticket type
 */
export async function updateTicketType(
  id: string,
  data: Partial<CreateTicketTypeInput>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.maxPerOrder !== undefined) updateData.maxPerOrder = data.maxPerOrder;
  if (data.salesStart !== undefined) updateData.salesStart = data.salesStart;
  if (data.salesEnd !== undefined) updateData.salesEnd = data.salesEnd;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.includedItems !== undefined) {
    updateData.includedItems = JSON.stringify(data.includedItems);
  }

  const result = await prisma.eventTicketType.update({
    where: { id },
    data: updateData,
  });

  return !!result;
}

/**
 * Get available tickets for an event
 */
export async function getAvailableTickets(eventId: string): Promise<
  Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    available: number | null;
    maxPerOrder: number;
    includedItems: string[];
    salesOpen: boolean;
  }>
> {
  const now = new Date();

  const ticketTypes = await prisma.eventTicketType.findMany({
    where: {
      eventId,
      isVisible: true,
    },
    orderBy: { order: 'asc' },
  });

  return ticketTypes.map((t) => {
    const available = t.quantity ? t.quantity - t.sold - t.reserved : null;
    const salesOpen =
      (!t.salesStart || t.salesStart <= now) &&
      (!t.salesEnd || t.salesEnd >= now) &&
      (available === null || available > 0);

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      available,
      maxPerOrder: t.maxPerOrder,
      includedItems: JSON.parse(t.includedItems || '[]'),
      salesOpen,
    };
  });
}

/**
 * Reserve tickets during checkout
 */
export async function reserveTickets(
  ticketTypeId: string,
  quantity: number
): Promise<boolean> {
  const ticketType = await prisma.eventTicketType.findUnique({
    where: { id: ticketTypeId },
  });

  if (!ticketType) return false;

  // Check availability
  if (ticketType.quantity) {
    const available = ticketType.quantity - ticketType.sold - ticketType.reserved;
    if (available < quantity) return false;
  }

  // Check max per order
  if (quantity > ticketType.maxPerOrder) return false;

  await prisma.eventTicketType.update({
    where: { id: ticketTypeId },
    data: { reserved: { increment: quantity } },
  });

  return true;
}

/**
 * Release reserved tickets (if checkout fails)
 */
export async function releaseReservation(
  ticketTypeId: string,
  quantity: number
): Promise<void> {
  await prisma.eventTicketType.update({
    where: { id: ticketTypeId },
    data: { reserved: { decrement: quantity } },
  });
}

/**
 * Convert reservation to sold tickets
 */
export async function confirmTicketSale(
  ticketTypeId: string,
  quantity: number,
  registrationId: string
): Promise<Array<{ id: string; ticketNumber: string }>> {
  // Update ticket type counts
  await prisma.eventTicketType.update({
    where: { id: ticketTypeId },
    data: {
      sold: { increment: quantity },
      reserved: { decrement: quantity },
    },
  });

  // Create individual tickets
  const tickets: Array<{ id: string; ticketNumber: string }> = [];

  for (let i = 0; i < quantity; i++) {
    const ticketNumber = `TKT-${nanoid(10).toUpperCase()}`;
    const ticket = await prisma.eventTicket.create({
      data: {
        ticketTypeId,
        registrationId,
        ticketNumber,
        status: 'valid',
      },
      select: { id: true, ticketNumber: true },
    });
    tickets.push(ticket);
  }

  return tickets;
}

/**
 * Check in a ticket
 */
export async function checkInTicket(
  ticketNumber: string
): Promise<{
  success: boolean;
  ticket?: {
    id: string;
    attendeeName: string | null;
    ticketType: string;
    alreadyCheckedIn: boolean;
  };
  error?: string;
}> {
  const ticket = await prisma.eventTicket.findUnique({
    where: { ticketNumber },
    include: {
      ticketType: { select: { name: true } },
    },
  });

  if (!ticket) {
    return { success: false, error: 'Ticket not found' };
  }

  if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
    return { success: false, error: 'Ticket is no longer valid' };
  }

  const alreadyCheckedIn = !!ticket.checkedInAt;

  if (!alreadyCheckedIn) {
    await prisma.eventTicket.update({
      where: { id: ticket.id },
      data: {
        status: 'used',
        checkedInAt: new Date(),
      },
    });
  }

  return {
    success: true,
    ticket: {
      id: ticket.id,
      attendeeName: ticket.attendeeName,
      ticketType: ticket.ticketType.name,
      alreadyCheckedIn,
    },
  };
}

/**
 * Get check-in stats
 */
export async function getCheckInStats(eventId: string): Promise<{
  totalTickets: number;
  checkedIn: number;
  remaining: number;
  percentage: number;
}> {
  const [total, checkedIn] = await Promise.all([
    prisma.eventTicket.count({
      where: {
        registration: { eventId },
        status: { in: ['valid', 'used'] },
      },
    }),
    prisma.eventTicket.count({
      where: {
        registration: { eventId },
        status: 'used',
      },
    }),
  ]);

  return {
    totalTickets: total,
    checkedIn,
    remaining: total - checkedIn,
    percentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
  };
}

/**
 * Cancel a ticket
 */
export async function cancelTicket(
  ticketId: string,
  refund: boolean = false
): Promise<boolean> {
  const ticket = await prisma.eventTicket.findUnique({
    where: { id: ticketId },
    include: { ticketType: true },
  });

  if (!ticket || ticket.status !== 'valid') return false;

  await prisma.$transaction([
    prisma.eventTicket.update({
      where: { id: ticketId },
      data: { status: refund ? 'refunded' : 'cancelled' },
    }),
    prisma.eventTicketType.update({
      where: { id: ticket.ticketTypeId },
      data: { sold: { decrement: 1 } },
    }),
  ]);

  return true;
}
