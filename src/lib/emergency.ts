import { prisma } from './prisma';

export type EmergencyType = 'natural_disaster' | 'crisis' | 'emergency' | 'humanitarian';
export type EmergencyStatus = 'active' | 'resolved' | 'closed';

// Get all active emergency campaigns
export async function getActiveEmergencies() {
  return prisma.emergencyCampaign.findMany({
    where: { status: 'active' },
    orderBy: [{ priority: 'desc' }, { startDate: 'desc' }],
    include: {
      _count: { select: { updates: true } },
    },
  });
}

// Get the highest priority emergency (for banner)
export async function getTopEmergency() {
  return prisma.emergencyCampaign.findFirst({
    where: { status: 'active' },
    orderBy: { priority: 'desc' },
  });
}

// Get emergency by slug
export async function getEmergencyBySlug(slug: string) {
  return prisma.emergencyCampaign.findUnique({
    where: { slug },
    include: {
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { updates: true } },
    },
  });
}

// Create emergency campaign (admin only)
export async function createEmergencyCampaign(
  createdBy: string,
  data: {
    title: string;
    slug: string;
    description: string;
    type: EmergencyType;
    location?: string;
    affectedArea?: string;
    targetAmount?: number;
    verifiedOrgs?: string[];
    priority?: number;
  }
) {
  return prisma.emergencyCampaign.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      type: data.type,
      location: data.location,
      affectedArea: data.affectedArea,
      targetAmount: data.targetAmount,
      verifiedOrgs: data.verifiedOrgs?.join(','),
      priority: data.priority ?? 0,
      createdBy,
      status: 'active',
    },
  });
}

// Update emergency campaign
export async function updateEmergencyCampaign(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    targetAmount: number;
    verifiedOrgs: string[];
    priority: number;
    status: EmergencyStatus;
    endDate: Date;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.verifiedOrgs) {
    updateData.verifiedOrgs = data.verifiedOrgs.join(',');
  }

  return prisma.emergencyCampaign.update({
    where: { id },
    data: updateData,
  });
}

// Add update to emergency campaign
export async function addEmergencyUpdate(
  campaignId: string,
  authorId: string,
  data: { title: string; content: string }
) {
  return prisma.emergencyUpdate.create({
    data: {
      campaignId,
      authorId,
      title: data.title,
      content: data.content,
    },
  });
}

// Get updates for an emergency
export async function getEmergencyUpdates(campaignId: string, options?: { limit?: number }) {
  return prisma.emergencyUpdate.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 20,
  });
}

// Contribute to emergency campaign
export async function contributeToEmergency(
  campaignId: string,
  contributorId: string,
  amount: number
) {
  const campaign = await prisma.emergencyCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.status !== 'active') {
    throw new Error('Campaign not found or not active');
  }

  // Get contributor's watershed
  const watershed = await prisma.watershed.findUnique({
    where: { userId: contributorId },
  });

  if (!watershed || watershed.balance < amount) {
    throw new Error('Insufficient watershed balance');
  }

  // Update campaign amount
  await prisma.emergencyCampaign.update({
    where: { id: campaignId },
    data: {
      currentAmount: { increment: amount },
      backerCount: { increment: 1 },
    },
  });

  // Deduct from watershed
  await prisma.$transaction([
    prisma.watershed.update({
      where: { userId: contributorId },
      data: { balance: { decrement: amount } },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: watershed.id,
        type: 'emergency_contribution',
        amount: -amount,
        description: `Contribution to ${campaign.title}`,
        balanceAfter: watershed.balance - amount,
      },
    }),
  ]);

  return prisma.emergencyCampaign.findUnique({
    where: { id: campaignId },
  });
}

// Resolve emergency campaign
export async function resolveEmergency(id: string) {
  return prisma.emergencyCampaign.update({
    where: { id },
    data: {
      status: 'resolved',
      endDate: new Date(),
    },
  });
}

// Close emergency campaign
export async function closeEmergency(id: string) {
  return prisma.emergencyCampaign.update({
    where: { id },
    data: {
      status: 'closed',
      endDate: new Date(),
    },
  });
}

// Get verified orgs for an emergency
export async function getEmergencyVerifiedOrgs(campaign: { verifiedOrgs: string | null }) {
  if (!campaign.verifiedOrgs) return [];

  const orgIds = campaign.verifiedOrgs.split(',').filter(Boolean);
  if (orgIds.length === 0) return [];

  // Return business listings that are verified relief organizations
  return prisma.businessListing.findMany({
    where: {
      id: { in: orgIds },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
    },
  });
}

// Calculate emergency progress
export function calculateEmergencyProgress(
  currentAmount: number,
  targetAmount: number | null
): number {
  if (!targetAmount || targetAmount === 0) return 0;
  return Math.min(100, (currentAmount / targetAmount) * 100);
}

// Get emergency type label
export function getEmergencyTypeLabel(type: EmergencyType): string {
  const labels: Record<EmergencyType, string> = {
    natural_disaster: 'Natural Disaster',
    crisis: 'Crisis',
    emergency: 'Emergency',
    humanitarian: 'Humanitarian',
  };
  return labels[type] || type;
}
