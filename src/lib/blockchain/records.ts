/**
 * Transparency Record Management
 * Plan 27: Blockchain Transparency Ledger
 *
 * Creates and manages immutable transparency records for platform transactions.
 */

import { prisma } from '@/lib/prisma';
import { generateRecordHash } from './hashing';

export type RecordType =
  | 'contribution'
  | 'allocation'
  | 'disbursement'
  | 'impact'
  | 'loan_funded'
  | 'loan_repaid'
  | 'milestone';

export type EntityType =
  | 'project'
  | 'loan'
  | 'community'
  | 'watershed'
  | 'user'
  | 'grant';

export interface CreateRecordInput {
  recordType: RecordType;
  entityType: EntityType;
  entityId: string;
  amount?: number;
  metadata: Record<string, unknown>;
}

/**
 * Create a new transparency record
 */
export async function createTransparencyRecord(
  input: CreateRecordInput
): Promise<{ id: string; hash: string }> {
  // Get the previous record's hash for chain linking
  const previousRecord = await prisma.transparencyRecord.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { hash: true },
  });

  const timestamp = new Date();

  // Generate hash
  const hash = generateRecordHash({
    recordType: input.recordType,
    entityType: input.entityType,
    entityId: input.entityId,
    amount: input.amount,
    metadata: input.metadata,
    previousHash: previousRecord?.hash,
    timestamp,
  });

  // Create record
  const record = await prisma.transparencyRecord.create({
    data: {
      recordType: input.recordType,
      entityType: input.entityType,
      entityId: input.entityId,
      amount: input.amount,
      metadata: JSON.stringify(input.metadata),
      hash,
      previousHash: previousRecord?.hash,
      anchorStatus: 'pending',
      createdAt: timestamp,
    },
    select: { id: true, hash: true },
  });

  return record;
}

/**
 * Create a record for a contribution/allocation
 */
export async function recordContribution(data: {
  userId: string;
  projectId: string;
  amount: number;
  projectTitle: string;
}): Promise<{ id: string; hash: string }> {
  return createTransparencyRecord({
    recordType: 'contribution',
    entityType: 'project',
    entityId: data.projectId,
    amount: data.amount,
    metadata: {
      userId: data.userId,
      projectTitle: data.projectTitle,
      action: 'funded',
    },
  });
}

/**
 * Create a record for a loan funding
 */
export async function recordLoanFunding(data: {
  funderId: string;
  loanId: string;
  amount: number;
  borrowerId: string;
  purpose: string;
}): Promise<{ id: string; hash: string }> {
  return createTransparencyRecord({
    recordType: 'loan_funded',
    entityType: 'loan',
    entityId: data.loanId,
    amount: data.amount,
    metadata: {
      funderId: data.funderId,
      borrowerId: data.borrowerId,
      purpose: data.purpose,
    },
  });
}

/**
 * Create a record for a loan repayment
 */
export async function recordLoanRepayment(data: {
  borrowerId: string;
  loanId: string;
  amount: number;
  isFullRepayment: boolean;
}): Promise<{ id: string; hash: string }> {
  return createTransparencyRecord({
    recordType: 'loan_repaid',
    entityType: 'loan',
    entityId: data.loanId,
    amount: data.amount,
    metadata: {
      borrowerId: data.borrowerId,
      isFullRepayment: data.isFullRepayment,
    },
  });
}

/**
 * Create a record for a grant disbursement
 */
export async function recordGrantDisbursement(data: {
  awardId: string;
  recipientId: string;
  amount: number;
  programName: string;
}): Promise<{ id: string; hash: string }> {
  return createTransparencyRecord({
    recordType: 'disbursement',
    entityType: 'grant',
    entityId: data.awardId,
    amount: data.amount,
    metadata: {
      recipientId: data.recipientId,
      programName: data.programName,
      type: 'grant_disbursement',
    },
  });
}

/**
 * Create a record for a project milestone
 */
export async function recordProjectMilestone(data: {
  projectId: string;
  projectTitle: string;
  milestone: string;
  percentComplete: number;
}): Promise<{ id: string; hash: string }> {
  return createTransparencyRecord({
    recordType: 'milestone',
    entityType: 'project',
    entityId: data.projectId,
    metadata: {
      projectTitle: data.projectTitle,
      milestone: data.milestone,
      percentComplete: data.percentComplete,
    },
  });
}

/**
 * Create a record for impact metrics
 */
export async function recordImpactMetric(data: {
  projectId: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
}): Promise<{ id: string; hash: string }> {
  return createTransparencyRecord({
    recordType: 'impact',
    entityType: 'project',
    entityId: data.projectId,
    metadata: {
      metricName: data.metricName,
      metricValue: data.metricValue,
      metricUnit: data.metricUnit,
    },
  });
}

/**
 * Get pending records for anchoring
 */
export async function getPendingRecords(
  limit: number = 1000
): Promise<
  Array<{
    id: string;
    hash: string;
    recordType: string;
    entityType: string;
    createdAt: Date;
  }>
> {
  return prisma.transparencyRecord.findMany({
    where: { anchorStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      hash: true,
      recordType: true,
      entityType: true,
      createdAt: true,
    },
  });
}

/**
 * Mark records as anchored
 */
export async function markRecordsAnchored(
  recordIds: string[],
  txHash: string,
  chain: string
): Promise<void> {
  await prisma.transparencyRecord.updateMany({
    where: { id: { in: recordIds } },
    data: {
      anchorStatus: 'anchored',
      anchorTxHash: txHash,
      anchorChain: chain,
      anchoredAt: new Date(),
    },
  });
}

/**
 * Get a record by hash
 */
export async function getRecordByHash(hash: string) {
  return prisma.transparencyRecord.findUnique({
    where: { hash },
    include: {
      proofs: true,
    },
  });
}

/**
 * Get records for an entity
 */
export async function getEntityRecords(
  entityType: EntityType,
  entityId: string
): Promise<
  Array<{
    id: string;
    recordType: string;
    amount: number | null;
    hash: string;
    anchorStatus: string;
    createdAt: Date;
  }>
> {
  return prisma.transparencyRecord.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      recordType: true,
      amount: true,
      hash: true,
      anchorStatus: true,
      createdAt: true,
    },
  });
}

/**
 * Get transparency statistics
 */
export async function getTransparencyStats(): Promise<{
  totalRecords: number;
  anchoredRecords: number;
  pendingRecords: number;
  failedRecords: number;
  lastAnchoredAt: Date | null;
}> {
  const [total, anchored, pending, failed, lastAnchored] = await Promise.all([
    prisma.transparencyRecord.count(),
    prisma.transparencyRecord.count({ where: { anchorStatus: 'anchored' } }),
    prisma.transparencyRecord.count({ where: { anchorStatus: 'pending' } }),
    prisma.transparencyRecord.count({ where: { anchorStatus: 'failed' } }),
    prisma.transparencyRecord.findFirst({
      where: { anchorStatus: 'anchored' },
      orderBy: { anchoredAt: 'desc' },
      select: { anchoredAt: true },
    }),
  ]);

  return {
    totalRecords: total,
    anchoredRecords: anchored,
    pendingRecords: pending,
    failedRecords: failed,
    lastAnchoredAt: lastAnchored?.anchoredAt ?? null,
  };
}
