/**
 * Event Registrations
 * Plan 30: Fundraising Events & Ticketing
 */

import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { confirmTicketSale, releaseReservation } from './tickets';
import { updateEventTotals } from './index';

export interface RegisterInput {
  eventId: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tickets: Array<{ ticketTypeId: string; quantity: number; attendees?: Array<{ name: string; email: string }> }>;
  donationAmount?: number;
}

/**
 * Create a registration
 */
export async function createRegistration(
  input: RegisterInput
): Promise<{ id: string; registrationCode: string }> {
  const registrationCode = `REG-${nanoid(8).toUpperCase()}`;

  // Calculate total
  let totalAmount = input.donationAmount || 0;
  for (const ticketOrder of input.tickets) {
    const ticketType = await prisma.eventTicketType.findUnique({
      where: { id: ticketOrder.ticketTypeId },
    });
    if (ticketType) {
      totalAmount += ticketType.price * ticketOrder.quantity;
    }
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: input.eventId,
      userId: input.userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      totalAmount,
      donationAmount: input.donationAmount || 0,
      registrationCode,
      paymentStatus: 'pending',
      status: 'confirmed',
    },
    select: { id: true, registrationCode: true },
  });

  return registration;
}

/**
 * Complete registration after payment
 */
export async function completeRegistration(
  registrationId: string,
  paymentRef: string,
  tickets: Array<{ ticketTypeId: string; quantity: number; attendees?: Array<{ name: string; email: string }> }>
): Promise<boolean> {
  try {
    // Update registration payment status
    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'completed',
        paymentRef,
      },
    });

    // Create tickets
    for (const ticketOrder of tickets) {
      const createdTickets = await confirmTicketSale(
        ticketOrder.ticketTypeId,
        ticketOrder.quantity,
        registrationId
      );

      // Update attendee info if provided
      if (ticketOrder.attendees) {
        for (let i = 0; i < Math.min(createdTickets.length, ticketOrder.attendees.length); i++) {
          await prisma.eventTicket.update({
            where: { id: createdTickets[i].id },
            data: {
              attendeeName: ticketOrder.attendees[i].name,
              attendeeEmail: ticketOrder.attendees[i].email,
            },
          });
        }
      }
    }

    // Update event totals
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      select: { eventId: true },
    });
    if (registration) {
      await updateEventTotals(registration.eventId);
    }

    return true;
  } catch (error) {
    console.error('Error completing registration:', error);
    // Release reservations if payment fails
    for (const ticketOrder of tickets) {
      await releaseReservation(ticketOrder.ticketTypeId, ticketOrder.quantity);
    }
    return false;
  }
}

/**
 * Get registration by code
 */
export async function getRegistrationByCode(registrationCode: string) {
  const registration = await prisma.eventRegistration.findUnique({
    where: { registrationCode },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          venue: true,
          address: true,
          virtualUrl: true,
        },
      },
      tickets: {
        include: {
          ticketType: { select: { name: true } },
        },
      },
    },
  });

  return registration;
}

/**
 * Get user's registrations
 */
export async function getUserRegistrations(
  userId: string
): Promise<
  Array<{
    id: string;
    registrationCode: string;
    eventId: string;
    eventTitle: string;
    eventSlug: string;
    startDate: Date;
    ticketCount: number;
    status: string;
    createdAt: Date;
  }>
> {
  const registrations = await prisma.eventRegistration.findMany({
    where: { userId, status: 'confirmed' },
    orderBy: { createdAt: 'desc' },
    include: {
      event: { select: { id: true, title: true, slug: true, startDate: true } },
      tickets: { select: { id: true } },
    },
  });

  return registrations.map((r) => ({
    id: r.id,
    registrationCode: r.registrationCode,
    eventId: r.event.id,
    eventTitle: r.event.title,
    eventSlug: r.event.slug,
    startDate: r.event.startDate,
    ticketCount: r.tickets.length,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

/**
 * Get event registrations (organizer view)
 */
export async function getEventRegistrations(
  eventId: string,
  options?: { status?: string; search?: string; limit?: number; offset?: number }
): Promise<{
  registrations: Array<{
    id: string;
    registrationCode: string;
    name: string;
    email: string;
    ticketCount: number;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: Date;
  }>;
  total: number;
}> {
  const where: Record<string, unknown> = { eventId };
  if (options?.status) where.status = options.status;
  if (options?.search) {
    where.OR = [
      { email: { contains: options.search } },
      { firstName: { contains: options.search } },
      { lastName: { contains: options.search } },
      { registrationCode: { contains: options.search } },
    ];
  }

  const [registrations, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        tickets: { select: { id: true } },
      },
    }),
    prisma.eventRegistration.count({ where }),
  ]);

  return {
    registrations: registrations.map((r) => ({
      id: r.id,
      registrationCode: r.registrationCode,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      ticketCount: r.tickets.length,
      totalAmount: r.totalAmount,
      paymentStatus: r.paymentStatus,
      status: r.status,
      createdAt: r.createdAt,
    })),
    total,
  };
}

/**
 * Cancel a registration
 */
export async function cancelRegistration(
  registrationId: string,
  refund: boolean = false
): Promise<boolean> {
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: { tickets: true },
  });

  if (!registration) return false;

  await prisma.$transaction([
    prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: 'cancelled',
        paymentStatus: refund ? 'refunded' : registration.paymentStatus,
      },
    }),
    prisma.eventTicket.updateMany({
      where: { registrationId },
      data: { status: refund ? 'refunded' : 'cancelled' },
    }),
    // Return ticket counts
    ...registration.tickets.map((t) =>
      prisma.eventTicketType.update({
        where: { id: t.ticketTypeId },
        data: { sold: { decrement: 1 } },
      })
    ),
  ]);

  await updateEventTotals(registration.eventId);

  return true;
}
