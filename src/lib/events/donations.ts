/**
 * Event Donations
 * Plan 30: Fundraising Events & Ticketing
 */

import { prisma } from '@/lib/prisma';
import { updateEventTotals } from './index';

export interface CreateDonationInput {
  eventId: string;
  userId?: string;
  donorName?: string;
  donorEmail?: string;
  amount: number;
  isAnonymous?: boolean;
  honoree?: string;
  message?: string;
}

/**
 * Create a donation
 */
export async function createDonation(
  input: CreateDonationInput
): Promise<{ id: string }> {
  const donation = await prisma.eventDonation.create({
    data: {
      eventId: input.eventId,
      userId: input.userId,
      donorName: input.isAnonymous ? null : input.donorName,
      donorEmail: input.donorEmail,
      amount: input.amount,
      isAnonymous: input.isAnonymous || false,
      honoree: input.honoree,
      message: input.message,
      paymentStatus: 'pending',
    },
    select: { id: true },
  });

  return donation;
}

/**
 * Complete donation after payment
 */
export async function completeDonation(
  donationId: string,
  paymentRef: string
): Promise<boolean> {
  const donation = await prisma.eventDonation.findUnique({
    where: { id: donationId },
    include: { event: { include: { matches: { where: { isActive: true } } } } },
  });

  if (!donation) return false;

  // Calculate matching
  let matchedAmount = 0;
  for (const match of donation.event.matches) {
    const availableMatch = match.maxAmount - match.matchedAmount;
    if (availableMatch > 0) {
      const matchAmount = Math.min(donation.amount * match.ratio, availableMatch);
      matchedAmount += matchAmount;

      await prisma.eventMatch.update({
        where: { id: match.id },
        data: { matchedAmount: { increment: matchAmount } },
      });
    }
  }

  await prisma.eventDonation.update({
    where: { id: donationId },
    data: {
      paymentStatus: 'completed',
      paymentRef,
      matchedAmount,
    },
  });

  await updateEventTotals(donation.eventId);

  return true;
}

/**
 * Get donation stats for an event (aggregate only, no individual details)
 */
export async function getDonationStats(eventId: string): Promise<{
  totalDonated: number;
  totalMatched: number;
  donorCount: number;
  averageDonation: number;
  honoraryCount: number;
}> {
  const stats = await prisma.eventDonation.aggregate({
    where: { eventId, paymentStatus: 'completed' },
    _count: true,
    _sum: { amount: true, matchedAmount: true },
  });

  const honorary = await prisma.eventDonation.count({
    where: { eventId, paymentStatus: 'completed', honoree: { not: null } },
  });

  return {
    totalDonated: stats._sum.amount || 0,
    totalMatched: stats._sum.matchedAmount || 0,
    donorCount: stats._count,
    averageDonation: stats._count > 0 ? (stats._sum.amount || 0) / stats._count : 0,
    honoraryCount: honorary,
  };
}

/**
 * Get donations for event (organizer view only - shows individual info)
 */
export async function getEventDonations(
  eventId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  donations: Array<{
    id: string;
    donorName: string | null;
    donorEmail: string | null;
    amount: number;
    matchedAmount: number;
    isAnonymous: boolean;
    honoree: string | null;
    message: string | null;
    paymentStatus: string;
    createdAt: Date;
  }>;
  total: number;
}> {
  const where = { eventId, paymentStatus: 'completed' };

  const [donations, total] = await Promise.all([
    prisma.eventDonation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.eventDonation.count({ where }),
  ]);

  return {
    donations: donations.map((d) => ({
      id: d.id,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      amount: d.amount,
      matchedAmount: d.matchedAmount,
      isAnonymous: d.isAnonymous,
      honoree: d.honoree,
      message: d.message,
      paymentStatus: d.paymentStatus,
      createdAt: d.createdAt,
    })),
    total,
  };
}

/**
 * Create a matching pledge
 */
export async function createMatch(
  eventId: string,
  matcherName: string,
  maxAmount: number,
  ratio: number = 1,
  message?: string
): Promise<{ id: string }> {
  const match = await prisma.eventMatch.create({
    data: {
      eventId,
      matcherName,
      maxAmount,
      ratio,
      message,
      isActive: true,
    },
    select: { id: true },
  });

  return match;
}

/**
 * Get active matches for an event
 */
export async function getActiveMatches(eventId: string): Promise<
  Array<{
    id: string;
    matcherName: string;
    maxAmount: number;
    matchedAmount: number;
    remaining: number;
    ratio: number;
    message: string | null;
  }>
> {
  const matches = await prisma.eventMatch.findMany({
    where: { eventId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  return matches.map((m) => ({
    id: m.id,
    matcherName: m.matcherName,
    maxAmount: m.maxAmount,
    matchedAmount: m.matchedAmount,
    remaining: m.maxAmount - m.matchedAmount,
    ratio: m.ratio,
    message: m.message,
  }));
}
