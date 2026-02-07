// Fraud detection and red flag management

import { prisma } from '@/lib/prisma';

export type FlagType = 'duplicate' | 'suspicious_funding' | 'unresponsive' | 'misuse' | 'fraud';
export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FlagStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface FlagSubmission {
  projectId: string;
  type: FlagType;
  severity: FlagSeverity;
  description: string;
  evidence?: Record<string, unknown>;
  reportedBy?: string;
}

export const FLAG_TYPE_LABELS: Record<FlagType, string> = {
  duplicate: 'Duplicate Project',
  suspicious_funding: 'Suspicious Funding Pattern',
  unresponsive: 'Unresponsive Proposer',
  misuse: 'Fund Misuse',
  fraud: 'Suspected Fraud',
};

export const FLAG_SEVERITY_LABELS: Record<FlagSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const FLAG_SEVERITY_COLORS: Record<FlagSeverity, string> = {
  low: 'gray',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

// Submit a flag for a project
export async function submitProjectFlag(submission: FlagSubmission) {
  // Check for existing open flag of the same type
  const existing = await prisma.projectFlag.findFirst({
    where: {
      projectId: submission.projectId,
      type: submission.type,
      status: { in: ['open', 'investigating'] },
    },
  });

  if (existing) {
    // Update existing flag with additional evidence
    return prisma.projectFlag.update({
      where: { id: existing.id },
      data: {
        description: `${existing.description}\n\n---\nAdditional report:\n${submission.description}`,
        evidence: submission.evidence ? JSON.stringify(submission.evidence) : existing.evidence,
        severity: getSeverityPriority(submission.severity) > getSeverityPriority(existing.severity as FlagSeverity)
          ? submission.severity
          : existing.severity,
      },
    });
  }

  return prisma.projectFlag.create({
    data: {
      projectId: submission.projectId,
      type: submission.type,
      severity: submission.severity,
      description: submission.description,
      evidence: submission.evidence ? JSON.stringify(submission.evidence) : null,
      reportedBy: submission.reportedBy || 'system',
      status: 'open',
    },
  });
}

function getSeverityPriority(severity: FlagSeverity): number {
  const priorities: Record<FlagSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return priorities[severity];
}

// Get flags for a project
export async function getProjectFlags(projectId: string) {
  return prisma.projectFlag.findMany({
    where: { projectId },
    orderBy: [
      { status: 'asc' },
      { severity: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

// Get open flags for admin review
export async function getOpenFlags(
  options: {
    severity?: FlagSeverity;
    type?: FlagType;
    limit?: number;
  } = {}
) {
  const { severity, type, limit = 50 } = options;

  return prisma.projectFlag.findMany({
    where: {
      status: { in: ['open', 'investigating'] },
      ...(severity && { severity }),
      ...(type && { type }),
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          fundingGoal: true,
          fundingRaised: true,
          status: true,
        },
      },
    },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'asc' },
    ],
    take: limit,
  });
}

// Start investigating a flag
export async function startInvestigation(flagId: string, adminId: string) {
  return prisma.projectFlag.update({
    where: { id: flagId },
    data: {
      status: 'investigating',
      assignedTo: adminId,
    },
  });
}

// Resolve a flag
export async function resolveFlag(
  flagId: string,
  adminId: string,
  resolution: string,
  dismiss: boolean = false
) {
  return prisma.projectFlag.update({
    where: { id: flagId },
    data: {
      status: dismiss ? 'dismissed' : 'resolved',
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolution,
    },
  });
}

// Run automated fraud detection checks
export async function runFraudDetection(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      allocations: {
        include: { user: true },
      },
    },
  });

  if (!project) return [];

  const flags: FlagSubmission[] = [];

  // Check 1: Duplicate detection (similar titles)
  const similarProjects = await prisma.project.findMany({
    where: {
      id: { not: projectId },
      title: {
        contains: project.title.split(' ')[0], // Simple first-word match
      },
    },
    take: 5,
  });

  if (similarProjects.length > 0) {
    flags.push({
      projectId,
      type: 'duplicate',
      severity: 'low',
      description: `Potentially similar projects found: ${similarProjects.map((p) => p.title).join(', ')}`,
      reportedBy: 'system',
    });
  }

  // Check 2: Suspicious funding patterns
  const recentAllocations = project.allocations.filter(
    (a) => new Date(a.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );

  // Many small donations from same IP/pattern could be suspicious
  if (recentAllocations.length > 20) {
    const uniqueFunders = new Set(recentAllocations.map((a) => a.userId)).size;
    if (uniqueFunders < recentAllocations.length / 2) {
      flags.push({
        projectId,
        type: 'suspicious_funding',
        severity: 'medium',
        description: `${recentAllocations.length} allocations in 24h from ${uniqueFunders} unique users`,
        reportedBy: 'system',
      });
    }
  }

  // Check 3: Rapid funding to goal (could be legitimate viral, or sock puppets)
  const fundingPercentage = (project.fundingRaised / project.fundingGoal) * 100;
  const daysSinceCreation = (Date.now() - new Date(project.createdAt).getTime()) / (24 * 60 * 60 * 1000);

  if (fundingPercentage > 50 && daysSinceCreation < 1) {
    flags.push({
      projectId,
      type: 'suspicious_funding',
      severity: 'low',
      description: `Project reached ${fundingPercentage.toFixed(0)}% funding within ${daysSinceCreation.toFixed(1)} days`,
      reportedBy: 'system',
    });
  }

  // Submit all detected flags
  for (const flag of flags) {
    await submitProjectFlag(flag);
  }

  return flags;
}

// Get flag statistics
export async function getFlagStats() {
  const [byStatus, bySeverity, byType] = await Promise.all([
    prisma.projectFlag.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.projectFlag.groupBy({
      by: ['severity'],
      where: { status: { in: ['open', 'investigating'] } },
      _count: { id: true },
    }),
    prisma.projectFlag.groupBy({
      by: ['type'],
      where: { status: { in: ['open', 'investigating'] } },
      _count: { id: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const item of byStatus) {
    statusCounts[item.status] = item._count.id;
  }

  const severityCounts: Record<string, number> = {};
  for (const item of bySeverity) {
    severityCounts[item.severity] = item._count.id;
  }

  const typeCounts: Record<string, number> = {};
  for (const item of byType) {
    typeCounts[item.type] = item._count.id;
  }

  return {
    byStatus: statusCounts,
    bySeverity: severityCounts,
    byType: typeCounts,
    openCount: (statusCounts['open'] || 0) + (statusCounts['investigating'] || 0),
    criticalCount: severityCounts['critical'] || 0,
  };
}
