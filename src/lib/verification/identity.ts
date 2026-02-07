// Identity verification functions

import { prisma } from '@/lib/prisma';

export type IdentityType = 'personal' | 'business';
export type IdentityStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type DocumentType = 'drivers_license' | 'passport' | 'state_id' | 'ein';

export interface IdentityVerificationRequest {
  userId: string;
  type: IdentityType;
  documentType: DocumentType;
  documentData?: Record<string, unknown>;
}

// Get user's identity verification status
export async function getUserIdentityVerification(userId: string) {
  return prisma.identityVerification.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// Check if user has verified identity
export async function isUserIdentityVerified(userId: string): Promise<boolean> {
  const verification = await prisma.identityVerification.findFirst({
    where: {
      userId,
      status: 'verified',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  return !!verification;
}

// Start identity verification process
export async function startIdentityVerification(
  userId: string,
  type: IdentityType,
  documentType: DocumentType
) {
  // Check for existing pending verification
  const existing = await prisma.identityVerification.findFirst({
    where: {
      userId,
      status: 'pending',
    },
  });

  if (existing) {
    throw new Error('You already have a pending identity verification');
  }

  // In production, this would integrate with Stripe Identity or similar
  // For now, create a pending verification for manual review
  const verification = await prisma.identityVerification.create({
    data: {
      userId,
      type,
      documentType,
      status: 'pending',
      provider: 'manual',
    },
  });

  return verification;
}

// Submit identity verification documents
export async function submitIdentityDocuments(
  verificationId: string,
  documents: {
    frontUrl?: string;
    backUrl?: string;
    selfieUrl?: string;
  }
) {
  const verification = await prisma.identityVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.status !== 'pending') {
    throw new Error('Verification is not in pending status');
  }

  // Store document URLs (in production, these would be securely stored)
  // For now, just mark as pending review
  return verification;
}

// Admin: Review identity verification
export async function reviewIdentityVerification(
  verificationId: string,
  reviewerId: string,
  approved: boolean,
  verifiedName?: string,
  verifiedAddress?: string,
  rejectionReason?: string
) {
  const verification = await prisma.identityVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  const expiresAt = approved
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    : null;

  return prisma.identityVerification.update({
    where: { id: verificationId },
    data: {
      status: approved ? 'verified' : 'rejected',
      verifiedAt: approved ? new Date() : null,
      verifiedName,
      verifiedAddress,
      expiresAt,
      rejectionReason: approved ? null : rejectionReason,
    },
  });
}

// Get pending identity verifications for admin
export async function getPendingIdentityVerifications(limit: number = 50) {
  return prisma.identityVerification.findMany({
    where: { status: 'pending' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

// Get identity verification stats
export async function getIdentityVerificationStats() {
  const [byStatus, recentVerifications] = await Promise.all([
    prisma.identityVerification.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.identityVerification.count({
      where: {
        verifiedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const item of byStatus) {
    statusCounts[item.status] = item._count.id;
  }

  return {
    byStatus: statusCounts,
    recentVerifications,
    pending: statusCounts['pending'] || 0,
  };
}
