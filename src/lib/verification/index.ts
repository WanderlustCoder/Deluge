// Core verification functions

import { prisma } from '@/lib/prisma';
import { VerificationLevel, LEVEL_ORDER, getLevelIndex } from './levels';
import { CheckType, CheckStatus, getRequiredChecksForLevel, isCheckExpired } from './checks';

export interface ProjectVerificationSummary {
  projectId: string;
  level: VerificationLevel;
  trustScore: number | null;
  organizationVerified: boolean;
  documentsVerified: boolean;
  outcomeVerified: boolean;
  lastVerifiedAt: Date | null;
  expiresAt: Date | null;
  checks: {
    type: CheckType;
    status: CheckStatus;
    reviewedAt: Date | null;
  }[];
}

// Get or create verification record for a project
export async function getOrCreateProjectVerification(projectId: string) {
  let verification = await prisma.projectVerification.findUnique({
    where: { projectId },
    include: {
      checks: true,
      audits: true,
    },
  });

  if (!verification) {
    verification = await prisma.projectVerification.create({
      data: {
        projectId,
        level: 'unverified',
      },
      include: {
        checks: true,
        audits: true,
      },
    });
  }

  return verification;
}

// Get verification summary for a project
export async function getProjectVerificationSummary(projectId: string): Promise<ProjectVerificationSummary | null> {
  const verification = await prisma.projectVerification.findUnique({
    where: { projectId },
    include: {
      checks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!verification) {
    return null;
  }

  return {
    projectId: verification.projectId,
    level: verification.level as VerificationLevel,
    trustScore: verification.trustScore,
    organizationVerified: verification.organizationVerified,
    documentsVerified: verification.documentsVerified,
    outcomeVerified: verification.outcomeVerified,
    lastVerifiedAt: verification.lastVerifiedAt,
    expiresAt: verification.expiresAt,
    checks: verification.checks.map((check) => ({
      type: check.checkType as CheckType,
      status: check.status as CheckStatus,
      reviewedAt: check.reviewedAt,
    })),
  };
}

// Submit a verification check
export async function submitVerificationCheck(
  projectId: string,
  checkType: CheckType,
  evidence: Record<string, unknown>
) {
  const verification = await getOrCreateProjectVerification(projectId);

  // Check if there's already a pending check of this type
  const existingCheck = verification.checks.find(
    (c) => c.checkType === checkType && c.status === 'pending'
  );

  if (existingCheck) {
    throw new Error('A pending check of this type already exists');
  }

  const check = await prisma.verificationCheck.create({
    data: {
      verificationId: verification.id,
      checkType,
      status: 'pending',
      evidence: JSON.stringify(evidence),
    },
  });

  return check;
}

// Review a verification check (admin)
export async function reviewVerificationCheck(
  checkId: string,
  reviewerId: string,
  status: 'passed' | 'failed',
  notes?: string,
  expiresAt?: Date
) {
  const check = await prisma.verificationCheck.update({
    where: { id: checkId },
    data: {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: notes,
      expiresAt,
    },
    include: {
      verification: true,
    },
  });

  // Recalculate verification level
  await recalculateVerificationLevel(check.verification.projectId);

  return check;
}

// Recalculate verification level based on passed checks
export async function recalculateVerificationLevel(projectId: string) {
  const verification = await getOrCreateProjectVerification(projectId);

  // Get all passed, non-expired checks
  const passedChecks = verification.checks.filter(
    (c) => c.status === 'passed' && !isCheckExpired(c.expiresAt)
  );
  const passedTypes = new Set(passedChecks.map((c) => c.checkType));

  // Determine highest achievable level
  let newLevel: VerificationLevel = 'unverified';

  for (const level of ['basic', 'verified', 'audited'] as const) {
    const requiredChecks = getRequiredChecksForLevel(level);
    const hasAllRequired = requiredChecks.every((type) => passedTypes.has(type));

    if (hasAllRequired) {
      newLevel = level;
    } else {
      break;
    }
  }

  // Check if audited requires a completed audit
  if (newLevel === 'audited') {
    const hasCompletedAudit = verification.audits.some(
      (a) => a.status === 'completed' && a.rating === 'pass'
    );
    if (!hasCompletedAudit) {
      newLevel = 'verified';
    }
  }

  // Update verification record
  const updates: Record<string, unknown> = {
    level: newLevel,
    lastVerifiedAt: new Date(),
    organizationVerified: passedTypes.has('organization'),
    documentsVerified: passedTypes.has('documents'),
    outcomeVerified: passedTypes.has('outcome'),
  };

  // Set expiration based on earliest check expiration
  const expirations = passedChecks
    .map((c) => c.expiresAt)
    .filter((d): d is Date => d !== null);
  if (expirations.length > 0) {
    updates.expiresAt = new Date(Math.min(...expirations.map((d) => d.getTime())));
  }

  await prisma.projectVerification.update({
    where: { id: verification.id },
    data: updates,
  });

  return newLevel;
}

// Get pending verification checks for admin review
export async function getPendingVerificationChecks(limit: number = 50) {
  return prisma.verificationCheck.findMany({
    where: { status: 'pending' },
    include: {
      verification: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
}

// Get verification stats for admin dashboard
export async function getVerificationStats() {
  const [byLevel, pendingChecks, recentVerifications] = await Promise.all([
    prisma.projectVerification.groupBy({
      by: ['level'],
      _count: { id: true },
    }),
    prisma.verificationCheck.count({
      where: { status: 'pending' },
    }),
    prisma.projectVerification.count({
      where: {
        lastVerifiedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ]);

  const levelCounts: Record<string, number> = {};
  for (const item of byLevel) {
    levelCounts[item.level] = item._count.id;
  }

  return {
    byLevel: levelCounts,
    pendingChecks,
    recentVerifications,
  };
}

// Check if project meets minimum verification for an action
export async function meetsVerificationRequirement(
  projectId: string,
  requiredLevel: VerificationLevel
): Promise<boolean> {
  const verification = await prisma.projectVerification.findUnique({
    where: { projectId },
  });

  if (!verification) {
    return requiredLevel === 'unverified';
  }

  const currentIndex = getLevelIndex(verification.level as VerificationLevel);
  const requiredIndex = getLevelIndex(requiredLevel);

  return currentIndex >= requiredIndex;
}
