import { prisma } from '../prisma';
import { calculateDisputeDeadline } from './compliance';

export type DisputeType = 'balance' | 'payment_history' | 'account_status' | 'identity';
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'escalated';

export interface CreateDisputeData {
  loanId: string;
  disputeType: DisputeType;
  description: string;
  evidence?: string; // JSON string of document references
}

// Create a new credit dispute
export async function createDispute(
  userId: string,
  data: CreateDisputeData
) {
  // Verify loan belongs to user
  const loan = await prisma.loan.findUnique({
    where: { id: data.loanId },
    include: { creditReportingConsent: true },
  });

  if (!loan || loan.borrowerId !== userId) {
    throw new Error('Loan not found or unauthorized');
  }

  if (!loan.creditReportingConsent || loan.creditReportingConsent.withdrawnAt) {
    throw new Error('No active credit reporting for this loan');
  }

  // Check for existing open dispute on same loan
  const existingDispute = await prisma.creditDispute.findFirst({
    where: {
      loanId: data.loanId,
      status: { in: ['open', 'investigating'] },
    },
  });

  if (existingDispute) {
    throw new Error('An open dispute already exists for this loan');
  }

  const now = new Date();

  return prisma.creditDispute.create({
    data: {
      loanId: data.loanId,
      userId,
      disputeType: data.disputeType,
      description: data.description,
      evidence: data.evidence,
      status: 'open',
      dueDate: calculateDisputeDeadline(now),
    },
  });
}

// Get dispute by ID
export async function getDispute(id: string) {
  return prisma.creditDispute.findUnique({
    where: { id },
    include: {
      loan: {
        select: {
          id: true,
          amount: true,
          status: true,
          purpose: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// Get all disputes for a user
export async function getUserDisputes(userId: string) {
  return prisma.creditDispute.findMany({
    where: { userId },
    include: {
      loan: {
        select: { id: true, amount: true, purpose: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get all open disputes (admin)
export async function getOpenDisputes(options?: {
  status?: DisputeStatus;
  limit?: number;
  offset?: number;
}) {
  return prisma.creditDispute.findMany({
    where: options?.status ? { status: options.status } : undefined,
    include: {
      loan: {
        select: { id: true, amount: true, purpose: true, borrowerId: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { dueDate: 'asc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

// Update dispute status
export async function updateDisputeStatus(
  disputeId: string,
  status: DisputeStatus,
  resolution?: string
) {
  const updateData: Record<string, unknown> = { status };

  if (status === 'resolved' && resolution) {
    updateData.resolution = resolution;
    updateData.resolvedAt = new Date();
  }

  return prisma.creditDispute.update({
    where: { id: disputeId },
    data: updateData,
  });
}

// Add note to dispute
export async function addDisputeNote(
  disputeId: string,
  authorId: string,
  content: string,
  isInternal: boolean = true
) {
  return prisma.creditDisputeNote.create({
    data: {
      disputeId,
      authorId,
      content,
      isInternal,
    },
  });
}

// Mark dispute as resolved
export async function resolveDispute(
  disputeId: string,
  resolvedBy: string,
  resolution: string
) {
  await prisma.$transaction([
    prisma.creditDispute.update({
      where: { id: disputeId },
      data: {
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date(),
      },
    }),
    prisma.creditDisputeNote.create({
      data: {
        disputeId,
        authorId: resolvedBy,
        content: `Dispute resolved: ${resolution}`,
        isInternal: false,
      },
    }),
  ]);

  return getDispute(disputeId);
}

// Notify bureaus of dispute resolution
export async function notifyBureausOfResolution(disputeId: string) {
  const dispute = await prisma.creditDispute.findUnique({
    where: { id: disputeId },
    include: {
      loan: {
        include: { creditReportingStatus: true },
      },
    },
  });

  if (!dispute) {
    throw new Error('Dispute not found');
  }

  if (dispute.status !== 'resolved') {
    throw new Error('Dispute must be resolved before notifying bureaus');
  }

  // In production, this would send update to bureaus
  // For now, just mark as notified
  await prisma.creditDispute.update({
    where: { id: disputeId },
    data: {
      bureauNotified: true,
      bureauNotifiedAt: new Date(),
    },
  });

  return true;
}

// Escalate dispute
export async function escalateDispute(
  disputeId: string,
  escalatedBy: string,
  reason: string
) {
  await prisma.$transaction([
    prisma.creditDispute.update({
      where: { id: disputeId },
      data: { status: 'escalated' },
    }),
    prisma.creditDisputeNote.create({
      data: {
        disputeId,
        authorId: escalatedBy,
        content: `Dispute escalated: ${reason}`,
        isInternal: true,
      },
    }),
  ]);

  return getDispute(disputeId);
}

// Get dispute statistics
export async function getDisputeStats() {
  const [open, investigating, resolved, escalated, overdue] = await Promise.all([
    prisma.creditDispute.count({ where: { status: 'open' } }),
    prisma.creditDispute.count({ where: { status: 'investigating' } }),
    prisma.creditDispute.count({ where: { status: 'resolved' } }),
    prisma.creditDispute.count({ where: { status: 'escalated' } }),
    prisma.creditDispute.count({
      where: {
        status: { in: ['open', 'investigating'] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return {
    open,
    investigating,
    resolved,
    escalated,
    overdue,
    total: open + investigating + resolved + escalated,
  };
}

// Get dispute type labels
export function getDisputeTypeLabel(type: DisputeType): string {
  const labels: Record<DisputeType, string> = {
    balance: 'Balance Dispute',
    payment_history: 'Payment History Dispute',
    account_status: 'Account Status Dispute',
    identity: 'Identity Dispute',
  };
  return labels[type] || type;
}
