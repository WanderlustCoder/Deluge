// Outcome verification functions

import { prisma } from '@/lib/prisma';

export type OutcomeType = 'completion' | 'impact_metric' | 'milestone';
export type OutcomeStatus = 'pending' | 'verified' | 'disputed' | 'unverified';
export type VerificationMethod = 'self_reported' | 'community' | 'third_party';
export type RelationshipType = 'beneficiary' | 'witness' | 'neighbor' | 'volunteer';

export interface OutcomeSubmission {
  projectId: string;
  outcomeType: OutcomeType;
  description: string;
  targetValue?: number;
  actualValue?: number;
  evidence?: {
    photos?: string[];
    receipts?: string[];
    documents?: string[];
    links?: string[];
  };
}

// Get all outcome verifications for a project
export async function getProjectOutcomes(projectId: string) {
  return prisma.outcomeVerification.findMany({
    where: { projectId },
    include: {
      communityVerifications: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Submit an outcome for verification
export async function submitOutcome(submission: OutcomeSubmission) {
  return prisma.outcomeVerification.create({
    data: {
      projectId: submission.projectId,
      outcomeType: submission.outcomeType,
      description: submission.description,
      targetValue: submission.targetValue,
      actualValue: submission.actualValue,
      evidence: submission.evidence ? JSON.stringify(submission.evidence) : null,
      status: 'pending',
      verificationMethod: 'self_reported',
    },
  });
}

// Update an outcome with actual values
export async function updateOutcome(
  outcomeId: string,
  actualValue: number,
  evidence?: Record<string, unknown>
) {
  return prisma.outcomeVerification.update({
    where: { id: outcomeId },
    data: {
      actualValue,
      evidence: evidence ? JSON.stringify(evidence) : undefined,
    },
  });
}

// Community member verifies an outcome
export async function submitCommunityVerification(
  outcomeId: string,
  userId: string,
  relationship: RelationshipType,
  verification: 'confirmed' | 'disputed',
  comment?: string,
  evidence?: Record<string, unknown>
) {
  // Check if user already verified this outcome
  const existing = await prisma.communityVerification.findUnique({
    where: {
      outcomeId_userId: {
        outcomeId,
        userId,
      },
    },
  });

  if (existing) {
    throw new Error('You have already submitted a verification for this outcome');
  }

  const communityVerification = await prisma.communityVerification.create({
    data: {
      outcomeId,
      userId,
      relationship,
      verification,
      comment,
      evidence: evidence ? JSON.stringify(evidence) : null,
    },
  });

  // Update outcome verification method and potentially status
  await recalculateOutcomeStatus(outcomeId);

  return communityVerification;
}

// Recalculate outcome status based on community verifications
export async function recalculateOutcomeStatus(outcomeId: string) {
  const outcome = await prisma.outcomeVerification.findUnique({
    where: { id: outcomeId },
    include: {
      communityVerifications: true,
    },
  });

  if (!outcome) return;

  const confirmations = outcome.communityVerifications.filter(
    (v) => v.verification === 'confirmed'
  ).length;
  const disputes = outcome.communityVerifications.filter(
    (v) => v.verification === 'disputed'
  ).length;

  let newStatus: OutcomeStatus = 'pending';
  let verificationMethod: VerificationMethod = 'self_reported';

  // If 3+ confirmations and no disputes, mark as verified
  if (confirmations >= 3 && disputes === 0) {
    newStatus = 'verified';
    verificationMethod = 'community';
  }
  // If any disputes, mark as disputed
  else if (disputes > 0) {
    newStatus = 'disputed';
  }
  // If some confirmations but not enough
  else if (confirmations > 0) {
    newStatus = 'pending';
    verificationMethod = 'community';
  }

  await prisma.outcomeVerification.update({
    where: { id: outcomeId },
    data: {
      status: newStatus,
      verificationMethod,
    },
  });

  return newStatus;
}

// Admin: Manually verify an outcome
export async function adminVerifyOutcome(
  outcomeId: string,
  adminId: string,
  verified: boolean,
  notes?: string
) {
  return prisma.outcomeVerification.update({
    where: { id: outcomeId },
    data: {
      status: verified ? 'verified' : 'unverified',
      verifiedBy: adminId,
      verifiedAt: new Date(),
      verificationMethod: 'third_party',
      notes,
    },
  });
}

// Get community verifications for an outcome
export async function getOutcomeCommunityVerifications(outcomeId: string) {
  return prisma.communityVerification.findMany({
    where: { outcomeId },
    orderBy: { createdAt: 'desc' },
  });
}

// Get pending outcomes for admin review
export async function getPendingOutcomes(limit: number = 50) {
  return prisma.outcomeVerification.findMany({
    where: {
      OR: [
        { status: 'pending' },
        { status: 'disputed' },
      ],
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
      communityVerifications: true,
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

// Get outcome verification stats
export async function getOutcomeVerificationStats() {
  const [byStatus, recentVerifications] = await Promise.all([
    prisma.outcomeVerification.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.outcomeVerification.count({
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
    disputed: statusCounts['disputed'] || 0,
  };
}
