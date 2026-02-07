import { prisma } from './prisma';

// In-kind donation types
export const IN_KIND_TYPES = {
  materials: { label: 'Materials', description: 'Physical supplies and goods' },
  equipment: { label: 'Equipment', description: 'Tools, machinery, or devices' },
  space: { label: 'Space', description: 'Venue, office, or storage space' },
  services: { label: 'Services', description: 'Professional or trade services' },
};

// Project needs types
export const NEED_TYPES = {
  materials: { label: 'Materials', icon: '📦' },
  equipment: { label: 'Equipment', icon: '🔧' },
  space: { label: 'Space', icon: '🏢' },
  services: { label: 'Services', icon: '🛠️' },
  volunteer_hours: { label: 'Volunteer Hours', icon: '⏰' },
};

// Create a project need
export async function createProjectNeed(
  projectId: string,
  data: {
    type: string;
    description: string;
    quantity?: number;
    estimatedValue?: number;
  }
) {
  return prisma.projectNeed.create({
    data: {
      projectId,
      type: data.type,
      description: data.description,
      quantity: data.quantity,
      estimatedValue: data.estimatedValue,
    },
  });
}

// Get project needs
export async function getProjectNeeds(projectId: string, includeFullfilled: boolean = false) {
  return prisma.projectNeed.findMany({
    where: {
      projectId,
      ...(includeFullfilled ? {} : { fulfilled: false }),
    },
    orderBy: [{ fulfilled: 'asc' }, { createdAt: 'desc' }],
  });
}

// Update project need
export async function updateProjectNeed(
  id: string,
  data: Partial<{
    description: string;
    quantity: number;
    estimatedValue: number;
    fulfilled: boolean;
    fulfilledBy: string;
  }>
) {
  return prisma.projectNeed.update({
    where: { id },
    data,
  });
}

// Delete project need
export async function deleteProjectNeed(id: string) {
  return prisma.projectNeed.delete({
    where: { id },
  });
}

// Offer in-kind donation
export async function offerInKindDonation(
  projectId: string,
  userId: string,
  data: {
    type: string;
    description: string;
    value?: number;
    notes?: string;
  }
) {
  // Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return prisma.inKindDonation.create({
    data: {
      projectId,
      userId,
      type: data.type,
      description: data.description,
      value: data.value,
      notes: data.notes,
      status: 'offered',
    },
  });
}

// Get in-kind donations for a project
export async function getProjectInKindDonations(projectId: string) {
  return prisma.inKindDonation.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get user's in-kind donations
export async function getUserInKindDonations(userId: string) {
  return prisma.inKindDonation.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Update donation status
export async function updateDonationStatus(
  id: string,
  status: string,
  notes?: string
) {
  const donation = await prisma.inKindDonation.findUnique({
    where: { id },
  });

  if (!donation) {
    throw new Error('Donation not found');
  }

  const updateData: Record<string, unknown> = { status };

  if (notes) {
    updateData.notes = notes;
  }

  if (status === 'received') {
    updateData.receivedAt = new Date();
  }

  return prisma.inKindDonation.update({
    where: { id },
    data: updateData,
  });
}

// Accept donation
export async function acceptDonation(id: string) {
  return updateDonationStatus(id, 'accepted');
}

// Mark donation as received
export async function markDonationReceived(id: string) {
  return updateDonationStatus(id, 'received');
}

// Decline donation
export async function declineDonation(id: string, reason?: string) {
  return updateDonationStatus(id, 'declined', reason);
}

// Link donation to project need
export async function fulfillNeedWithDonation(needId: string, donationId: string) {
  const donation = await prisma.inKindDonation.findUnique({
    where: { id: donationId },
  });

  if (!donation) {
    throw new Error('Donation not found');
  }

  await prisma.projectNeed.update({
    where: { id: needId },
    data: {
      fulfilled: true,
      fulfilledBy: donation.userId,
    },
  });

  return donation;
}

// Get in-kind stats for user
export async function getUserInKindStats(userId: string) {
  const donations = await prisma.inKindDonation.findMany({
    where: { userId },
    select: {
      type: true,
      value: true,
      status: true,
    },
  });

  const received = donations.filter((d) => d.status === 'received');
  const totalValue = received.reduce((sum, d) => sum + (d.value || 0), 0);

  const byType: Record<string, number> = {};
  for (const d of received) {
    byType[d.type] = (byType[d.type] || 0) + 1;
  }

  return {
    totalDonations: donations.length,
    receivedDonations: received.length,
    totalEstimatedValue: totalValue,
    byType,
  };
}

// Get in-kind stats for project
export async function getProjectInKindStats(projectId: string) {
  const [donations, needs] = await Promise.all([
    prisma.inKindDonation.findMany({
      where: { projectId },
      select: {
        type: true,
        value: true,
        status: true,
      },
    }),
    prisma.projectNeed.findMany({
      where: { projectId },
      select: {
        type: true,
        fulfilled: true,
        estimatedValue: true,
      },
    }),
  ]);

  const receivedDonations = donations.filter((d) => d.status === 'received');
  const totalReceivedValue = receivedDonations.reduce((sum, d) => sum + (d.value || 0), 0);

  const totalNeeds = needs.length;
  const fulfilledNeeds = needs.filter((n) => n.fulfilled).length;
  const totalNeedsValue = needs.reduce((sum, n) => sum + (n.estimatedValue || 0), 0);

  return {
    totalDonationsOffered: donations.length,
    donationsReceived: receivedDonations.length,
    totalReceivedValue,
    totalNeeds,
    fulfilledNeeds,
    needsFulfillmentRate: totalNeeds > 0 ? (fulfilledNeeds / totalNeeds) * 100 : 0,
    totalNeedsValue,
  };
}

// Format donation for display
export function formatDonationForDisplay(donation: {
  id: string;
  type: string;
  description: string;
  value?: number | null;
  status: string;
  createdAt: Date;
  receivedAt?: Date | null;
}) {
  const typeInfo = IN_KIND_TYPES[donation.type as keyof typeof IN_KIND_TYPES];

  return {
    ...donation,
    typeLabel: typeInfo?.label || donation.type,
    formattedValue: donation.value ? `$${donation.value.toFixed(2)}` : 'Not specified',
    statusLabel: {
      offered: 'Pending Review',
      accepted: 'Accepted',
      received: 'Received',
      declined: 'Declined',
    }[donation.status] || donation.status,
    formattedDate: donation.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}
