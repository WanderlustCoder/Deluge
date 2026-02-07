// Third-party audit management

import { prisma } from '@/lib/prisma';
import { getOrCreateProjectVerification, recalculateVerificationLevel } from './index';

export type AuditType = 'financial' | 'impact' | 'compliance';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type AuditRating = 'pass' | 'conditional' | 'fail';
export type AuditorStatus = 'pending' | 'approved' | 'suspended';

export interface AuditRequest {
  projectId: string;
  auditorId: string;
  auditType: AuditType;
  scope: string;
  startDate: Date;
}

export interface AuditFindings {
  summary: string;
  findings: {
    category: string;
    description: string;
    severity: 'info' | 'minor' | 'major' | 'critical';
    recommendation?: string;
  }[];
  conclusion: string;
}

// Request an audit for a project
export async function requestAudit(request: AuditRequest) {
  const verification = await getOrCreateProjectVerification(request.projectId);

  // Check if auditor is approved
  const auditor = await prisma.auditor.findFirst({
    where: {
      userId: request.auditorId,
      status: 'approved',
    },
  });

  if (!auditor) {
    throw new Error('Auditor is not approved');
  }

  return prisma.projectAudit.create({
    data: {
      verificationId: verification.id,
      auditorId: request.auditorId,
      auditorOrg: auditor.organization,
      auditType: request.auditType,
      scope: request.scope,
      startDate: request.startDate,
      status: 'scheduled',
    },
  });
}

// Start an audit
export async function startAudit(auditId: string) {
  return prisma.projectAudit.update({
    where: { id: auditId },
    data: {
      status: 'in_progress',
    },
  });
}

// Complete an audit with findings
export async function completeAudit(
  auditId: string,
  findings: AuditFindings,
  rating: AuditRating,
  reportUrl?: string
) {
  const audit = await prisma.projectAudit.update({
    where: { id: auditId },
    data: {
      status: 'completed',
      completedDate: new Date(),
      findings: JSON.stringify(findings),
      rating,
      reportUrl,
    },
    include: {
      verification: true,
    },
  });

  // Increment auditor's completed count
  await prisma.auditor.update({
    where: { userId: audit.auditorId },
    data: {
      auditsCompleted: { increment: 1 },
    },
  });

  // Recalculate verification level
  if (rating === 'pass') {
    await recalculateVerificationLevel(audit.verification.projectId);
  }

  return audit;
}

// Cancel an audit
export async function cancelAudit(auditId: string, reason?: string) {
  return prisma.projectAudit.update({
    where: { id: auditId },
    data: {
      status: 'cancelled',
      findings: reason ? JSON.stringify({ cancellationReason: reason }) : null,
    },
  });
}

// Get audits for a project
export async function getProjectAudits(projectId: string) {
  const verification = await prisma.projectVerification.findUnique({
    where: { projectId },
    include: {
      audits: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return verification?.audits || [];
}

// =====================
// Auditor Management
// =====================

// Apply to become an auditor
export async function applyAsAuditor(
  userId: string,
  organization: string,
  credentials: string[],
  specialties: string[],
  bio?: string
) {
  // Check if already applied
  const existing = await prisma.auditor.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error('You have already applied to be an auditor');
  }

  return prisma.auditor.create({
    data: {
      userId,
      organization,
      credentials: credentials.join(','),
      specialties: specialties.join(','),
      bio,
      status: 'pending',
    },
  });
}

// Admin: Approve auditor
export async function approveAuditor(auditorId: string, adminId: string) {
  return prisma.auditor.update({
    where: { id: auditorId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
    },
  });
}

// Admin: Suspend auditor
export async function suspendAuditor(auditorId: string) {
  return prisma.auditor.update({
    where: { id: auditorId },
    data: {
      status: 'suspended',
    },
  });
}

// Get auditor profile
export async function getAuditorProfile(userId: string) {
  return prisma.auditor.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// List approved auditors
export async function listApprovedAuditors(specialty?: string) {
  return prisma.auditor.findMany({
    where: {
      status: 'approved',
      ...(specialty && {
        specialties: { contains: specialty },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [
      { auditsCompleted: 'desc' },
      { averageRating: 'desc' },
    ],
  });
}

// Get pending auditor applications
export async function getPendingAuditorApplications() {
  return prisma.auditor.findMany({
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
  });
}

// Get audit statistics
export async function getAuditStats() {
  const [byStatus, byType, byRating, auditorCount] = await Promise.all([
    prisma.projectAudit.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.projectAudit.groupBy({
      by: ['auditType'],
      _count: { id: true },
    }),
    prisma.projectAudit.groupBy({
      by: ['rating'],
      where: { status: 'completed' },
      _count: { id: true },
    }),
    prisma.auditor.count({
      where: { status: 'approved' },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const item of byStatus) {
    statusCounts[item.status] = item._count.id;
  }

  const typeCounts: Record<string, number> = {};
  for (const item of byType) {
    typeCounts[item.auditType] = item._count.id;
  }

  const ratingCounts: Record<string, number> = {};
  for (const item of byRating) {
    if (item.rating) {
      ratingCounts[item.rating] = item._count.id;
    }
  }

  return {
    byStatus: statusCounts,
    byType: typeCounts,
    byRating: ratingCounts,
    approvedAuditors: auditorCount,
    inProgress: statusCounts['in_progress'] || 0,
  };
}
