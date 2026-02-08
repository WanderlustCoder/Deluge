import { prisma } from '@/lib/prisma';

export type DonorSegment = 'major_donor' | 'recurring' | 'lapsed' | 'new';

export interface DonorFilter {
  organizationId: string;
  segment?: DonorSegment;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'total' | 'recent' | 'count';
}

// Calculate donor segment based on donation history
function calculateSegment(
  totalDonated: number,
  donationCount: number,
  lastDonation: Date | null
): DonorSegment {
  const daysSinceLastDonation = lastDonation
    ? (Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;

  if (totalDonated >= 1000 || (totalDonated >= 500 && donationCount >= 5)) {
    return 'major_donor';
  }

  if (daysSinceLastDonation > 365) {
    return 'lapsed';
  }

  if (donationCount >= 3 && daysSinceLastDonation < 180) {
    return 'recurring';
  }

  return 'new';
}

// Get or create donor relationship
export async function getOrCreateDonor(
  organizationId: string,
  email: string,
  userId?: string,
  firstName?: string,
  lastName?: string
) {
  let donor = await prisma.donorRelationship.findUnique({
    where: {
      organizationId_email: { organizationId, email },
    },
  });

  if (!donor) {
    donor = await prisma.donorRelationship.create({
      data: {
        organizationId,
        email,
        userId,
        firstName,
        lastName,
        segment: 'new',
      },
    });
  }

  return donor;
}

// Record donation and update donor stats
export async function recordDonation(
  organizationId: string,
  email: string,
  amount: number,
  options?: {
    userId?: string;
    projectId?: string;
    donorName?: string;
    isAnonymous?: boolean;
    source?: string;
  }
) {
  const { userId, projectId, donorName, isAnonymous = false, source = 'platform' } = options || {};

  // Parse donor name
  let firstName: string | undefined;
  let lastName: string | undefined;
  if (donorName) {
    const parts = donorName.split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ') || undefined;
  }

  // Get or create donor
  const donor = await getOrCreateDonor(organizationId, email, userId, firstName, lastName);

  // Record donation
  await prisma.organizationDonation.create({
    data: {
      organizationId,
      projectId,
      donorId: userId,
      donorName: isAnonymous ? 'Anonymous' : donorName,
      donorEmail: isAnonymous ? undefined : email,
      amount,
      isAnonymous,
      source,
    },
  });

  // Update donor stats
  const newTotalDonated = donor.totalDonated + amount;
  const newDonationCount = donor.donationCount + 1;
  const newAverageDonation = newTotalDonated / newDonationCount;
  const newSegment = calculateSegment(newTotalDonated, newDonationCount, new Date());

  await prisma.donorRelationship.update({
    where: { id: donor.id },
    data: {
      totalDonated: newTotalDonated,
      donationCount: newDonationCount,
      averageDonation: newAverageDonation,
      firstDonation: donor.firstDonation || new Date(),
      lastDonation: new Date(),
      segment: newSegment,
      firstName: firstName || donor.firstName,
      lastName: lastName || donor.lastName,
    },
  });

  return donor;
}

// List donors for organization
export async function listDonors(filter: DonorFilter) {
  const {
    organizationId,
    segment,
    search,
    limit = 20,
    offset = 0,
    sortBy = 'total',
  } = filter;

  const where: Record<string, unknown> = { organizationId };
  if (segment) where.segment = segment;
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case 'total':
      orderBy.totalDonated = 'desc';
      break;
    case 'recent':
      orderBy.lastDonation = 'desc';
      break;
    case 'count':
      orderBy.donationCount = 'desc';
      break;
  }

  const [donors, total] = await Promise.all([
    prisma.donorRelationship.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.donorRelationship.count({ where }),
  ]);

  return { donors, total };
}

// Get donor by ID
export async function getDonor(id: string) {
  return prisma.donorRelationship.findUnique({
    where: { id },
  });
}

// Get donor's donation history
export async function getDonorHistory(organizationId: string, email: string) {
  const donor = await prisma.donorRelationship.findUnique({
    where: {
      organizationId_email: { organizationId, email },
    },
  });

  if (!donor) {
    return null;
  }

  const donations = await prisma.organizationDonation.findMany({
    where: {
      organizationId,
      donorEmail: email,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { donor, donations };
}

// Update donor notes/tags
export async function updateDonor(
  id: string,
  data: {
    notes?: string;
    tags?: string[];
    externalId?: string;
  }
) {
  return prisma.donorRelationship.update({
    where: { id },
    data: {
      notes: data.notes,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      externalId: data.externalId,
    },
  });
}

// Get segment summary
export async function getDonorSegmentSummary(organizationId: string) {
  const segments = await prisma.donorRelationship.groupBy({
    by: ['segment'],
    where: { organizationId },
    _count: true,
    _sum: { totalDonated: true },
  });

  return segments.map((s) => ({
    segment: s.segment,
    count: s._count,
    totalDonated: s._sum.totalDonated || 0,
  }));
}

// Acknowledge donation
export async function acknowledgeDonation(donationId: string) {
  return prisma.organizationDonation.update({
    where: { id: donationId },
    data: { acknowledgedAt: new Date() },
  });
}

// Get pending acknowledgments
export async function getPendingAcknowledgments(organizationId: string) {
  return prisma.organizationDonation.findMany({
    where: {
      organizationId,
      acknowledgedAt: null,
      isAnonymous: false,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Bulk acknowledge donations
export async function bulkAcknowledgeDonations(donationIds: string[]) {
  return prisma.organizationDonation.updateMany({
    where: { id: { in: donationIds } },
    data: { acknowledgedAt: new Date() },
  });
}
