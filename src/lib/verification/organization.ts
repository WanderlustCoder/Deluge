// Organization verification functions

import { prisma } from '@/lib/prisma';

export type RegistrationType = '501c3' | '501c4' | 'government' | 'llc' | 'other';
export type OrgVerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface OrganizationVerificationRequest {
  projectId?: string;
  businessId?: string;
  organizationName: string;
  ein?: string;
  registrationNumber?: string;
  registrationType: RegistrationType;
  documents?: {
    einLetter?: string;
    registrationCertificate?: string;
    articlesOfIncorporation?: string;
  };
}

// Get organization verification for a project
export async function getProjectOrganizationVerification(projectId: string) {
  return prisma.organizationVerification.findFirst({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
}

// Check if organization is verified
export async function isOrganizationVerified(projectId: string): Promise<boolean> {
  const verification = await prisma.organizationVerification.findFirst({
    where: {
      projectId,
      verificationStatus: 'verified',
    },
  });

  return !!verification;
}

// Submit organization verification request
export async function submitOrganizationVerification(
  request: OrganizationVerificationRequest
) {
  if (!request.projectId && !request.businessId) {
    throw new Error('Either projectId or businessId is required');
  }

  // Check for existing pending verification
  const existing = await prisma.organizationVerification.findFirst({
    where: {
      OR: [
        { projectId: request.projectId },
        { businessId: request.businessId },
      ],
      verificationStatus: 'pending',
    },
  });

  if (existing) {
    throw new Error('An organization verification is already pending');
  }

  return prisma.organizationVerification.create({
    data: {
      projectId: request.projectId,
      businessId: request.businessId,
      organizationName: request.organizationName,
      ein: request.ein,
      registrationNumber: request.registrationNumber,
      registrationType: request.registrationType,
      verificationStatus: 'pending',
      documents: request.documents ? JSON.stringify(request.documents) : null,
    },
  });
}

// Admin: Review organization verification
export async function reviewOrganizationVerification(
  verificationId: string,
  reviewerId: string,
  approved: boolean,
  notes?: string
) {
  const verification = await prisma.organizationVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  return prisma.organizationVerification.update({
    where: { id: verificationId },
    data: {
      verificationStatus: approved ? 'verified' : 'rejected',
      verifiedAt: approved ? new Date() : null,
      verifiedBy: reviewerId,
      notes,
    },
  });
}

// Get pending organization verifications for admin
export async function getPendingOrganizationVerifications(limit: number = 50) {
  return prisma.organizationVerification.findMany({
    where: { verificationStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

// Validate EIN format (basic validation)
export function validateEIN(ein: string): boolean {
  // EIN format: XX-XXXXXXX
  const einPattern = /^\d{2}-\d{7}$/;
  return einPattern.test(ein);
}

// Format EIN with dash
export function formatEIN(ein: string): string {
  const digits = ein.replace(/\D/g, '');
  if (digits.length !== 9) return ein;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

// Get organization verification stats
export async function getOrganizationVerificationStats() {
  const [byStatus, byType] = await Promise.all([
    prisma.organizationVerification.groupBy({
      by: ['verificationStatus'],
      _count: { id: true },
    }),
    prisma.organizationVerification.groupBy({
      by: ['registrationType'],
      _count: { id: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const item of byStatus) {
    statusCounts[item.verificationStatus] = item._count.id;
  }

  const typeCounts: Record<string, number> = {};
  for (const item of byType) {
    if (item.registrationType) {
      typeCounts[item.registrationType] = item._count.id;
    }
  }

  return {
    byStatus: statusCounts,
    byType: typeCounts,
    pending: statusCounts['pending'] || 0,
  };
}
