/**
 * Impact Certificate Generation
 * Plan 27: Blockchain Transparency Ledger
 *
 * Issue verifiable impact certificates for contributions and achievements.
 */

import { prisma } from '@/lib/prisma';
import { generateCertificateHash } from './hashing';

export type CertificateType =
  | 'contribution'
  | 'project_backer'
  | 'loan_funder'
  | 'volunteer'
  | 'milestone';

export interface CreateCertificateInput {
  userId: string;
  certificateType: CertificateType;
  entityType: string;
  entityId: string;
  amount?: number;
  impactClaim: string;
  recordHash: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
}

/**
 * Create an impact certificate
 */
export async function createImpactCertificate(
  input: CreateCertificateInput
): Promise<{ id: string; certificateHash: string }> {
  const issuedAt = new Date();

  // Generate certificate hash
  const certificateHash = generateCertificateHash({
    userId: input.userId,
    certificateType: input.certificateType,
    entityType: input.entityType,
    entityId: input.entityId,
    amount: input.amount,
    impactClaim: input.impactClaim,
    recordHash: input.recordHash,
    issuedAt,
  });

  const certificate = await prisma.impactCertificate.create({
    data: {
      userId: input.userId,
      certificateType: input.certificateType,
      entityType: input.entityType,
      entityId: input.entityId,
      amount: input.amount,
      impactClaim: input.impactClaim,
      recordHash: input.recordHash,
      certificateHash,
      metadata: JSON.stringify(input.metadata || {}),
      isPublic: input.isPublic ?? true,
      issuedAt,
    },
    select: { id: true, certificateHash: true },
  });

  return certificate;
}

/**
 * Create a contribution certificate
 */
export async function createContributionCertificate(data: {
  userId: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  recordHash: string;
}): Promise<{ id: string; certificateHash: string }> {
  return createImpactCertificate({
    userId: data.userId,
    certificateType: 'contribution',
    entityType: 'project',
    entityId: data.projectId,
    amount: data.amount,
    impactClaim: `Contributed $${data.amount.toFixed(2)} to "${data.projectTitle}"`,
    recordHash: data.recordHash,
    metadata: { projectTitle: data.projectTitle },
  });
}

/**
 * Create a project backer certificate
 */
export async function createBackerCertificate(data: {
  userId: string;
  projectId: string;
  projectTitle: string;
  totalContributed: number;
  milestone: string;
  recordHash: string;
}): Promise<{ id: string; certificateHash: string }> {
  return createImpactCertificate({
    userId: data.userId,
    certificateType: 'project_backer',
    entityType: 'project',
    entityId: data.projectId,
    amount: data.totalContributed,
    impactClaim: `Helped "${data.projectTitle}" reach ${data.milestone}`,
    recordHash: data.recordHash,
    metadata: {
      projectTitle: data.projectTitle,
      milestone: data.milestone,
    },
  });
}

/**
 * Create a loan funder certificate
 */
export async function createLoanFunderCertificate(data: {
  userId: string;
  loanId: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  recordHash: string;
}): Promise<{ id: string; certificateHash: string }> {
  return createImpactCertificate({
    userId: data.userId,
    certificateType: 'loan_funder',
    entityType: 'loan',
    entityId: data.loanId,
    amount: data.amount,
    impactClaim: `Funded $${data.amount.toFixed(2)} for ${data.purpose}`,
    recordHash: data.recordHash,
    metadata: {
      borrowerName: data.borrowerName,
      purpose: data.purpose,
    },
  });
}

/**
 * Create a volunteer certificate
 */
export async function createVolunteerCertificate(data: {
  userId: string;
  projectId: string;
  projectTitle: string;
  hours: number;
  recordHash: string;
}): Promise<{ id: string; certificateHash: string }> {
  return createImpactCertificate({
    userId: data.userId,
    certificateType: 'volunteer',
    entityType: 'project',
    entityId: data.projectId,
    impactClaim: `Volunteered ${data.hours} hours for "${data.projectTitle}"`,
    recordHash: data.recordHash,
    metadata: {
      projectTitle: data.projectTitle,
      hours: data.hours,
    },
  });
}

/**
 * Get a certificate by hash
 */
export async function getCertificateByHash(
  hash: string
): Promise<{
  id: string;
  certificateType: string;
  entityType: string;
  entityId: string;
  amount: number | null;
  impactClaim: string;
  issuedAt: Date;
  certificateHash: string;
  recordHash: string;
  isPublic: boolean;
  viewCount: number;
  user: { id: string; name: string };
} | null> {
  const certificate = await prisma.impactCertificate.findUnique({
    where: { certificateHash: hash },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  if (!certificate) return null;

  // Increment view count
  await prisma.impactCertificate.update({
    where: { id: certificate.id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    id: certificate.id,
    certificateType: certificate.certificateType,
    entityType: certificate.entityType,
    entityId: certificate.entityId,
    amount: certificate.amount,
    impactClaim: certificate.impactClaim,
    issuedAt: certificate.issuedAt,
    certificateHash: certificate.certificateHash,
    recordHash: certificate.recordHash,
    isPublic: certificate.isPublic,
    viewCount: certificate.viewCount + 1,
    user: certificate.user,
  };
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(
  userId: string
): Promise<
  Array<{
    id: string;
    certificateType: string;
    entityType: string;
    amount: number | null;
    impactClaim: string;
    issuedAt: Date;
    certificateHash: string;
    isPublic: boolean;
    viewCount: number;
  }>
> {
  return prisma.impactCertificate.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    select: {
      id: true,
      certificateType: true,
      entityType: true,
      amount: true,
      impactClaim: true,
      issuedAt: true,
      certificateHash: true,
      isPublic: true,
      viewCount: true,
    },
  });
}

/**
 * Toggle certificate visibility
 */
export async function toggleCertificateVisibility(
  certificateId: string,
  userId: string,
  isPublic: boolean
): Promise<boolean> {
  const result = await prisma.impactCertificate.updateMany({
    where: { id: certificateId, userId },
    data: { isPublic },
  });

  return result.count > 0;
}

/**
 * Get certificate statistics for a user
 */
export async function getCertificateStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  totalViews: number;
  totalAmount: number;
}> {
  const certificates = await prisma.impactCertificate.findMany({
    where: { userId },
    select: {
      certificateType: true,
      viewCount: true,
      amount: true,
    },
  });

  const byType: Record<string, number> = {};
  let totalViews = 0;
  let totalAmount = 0;

  for (const cert of certificates) {
    byType[cert.certificateType] = (byType[cert.certificateType] || 0) + 1;
    totalViews += cert.viewCount;
    totalAmount += cert.amount || 0;
  }

  return {
    total: certificates.length,
    byType,
    totalViews,
    totalAmount,
  };
}
