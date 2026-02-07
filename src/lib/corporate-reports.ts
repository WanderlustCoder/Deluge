import { prisma } from './prisma';
import { getMatchingStats } from './corporate-matching';

// SDG mapping
export const SDG_MAPPING: Record<string, { id: number; name: string; color: string }> = {
  education: { id: 4, name: 'Quality Education', color: '#C5192D' },
  environment: { id: 13, name: 'Climate Action', color: '#3F7E44' },
  health: { id: 3, name: 'Good Health and Well-being', color: '#4C9F38' },
  food: { id: 2, name: 'Zero Hunger', color: '#DDA63A' },
  housing: { id: 11, name: 'Sustainable Cities and Communities', color: '#FD9D24' },
  community: { id: 11, name: 'Sustainable Cities and Communities', color: '#FD9D24' },
  economic: { id: 8, name: 'Decent Work and Economic Growth', color: '#A21942' },
  arts: { id: 4, name: 'Quality Education', color: '#C5192D' },
  youth: { id: 4, name: 'Quality Education', color: '#C5192D' },
};

// Report types
export type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom';

// Generate report data
export async function generateReportData(
  corporateAccountId: string,
  startDate: Date,
  endDate: Date
) {
  // Get matching stats
  const matchingStats = await getMatchingStats(corporateAccountId, startDate, endDate);

  // Get employee participation
  const employees = await prisma.corporateEmployee.findMany({
    where: { corporateAccountId, status: 'active' },
    select: { userId: true, department: true },
  });

  const participatingUserIds = await prisma.corporateMatchingRecord.findMany({
    where: {
      corporateAccountId,
      matchDate: { gte: startDate, lte: endDate },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  const participationRate = employees.length > 0
    ? (participatingUserIds.length / employees.length) * 100
    : 0;

  // Department breakdown
  const deptEmployees: Record<string, number> = {};
  const deptParticipants: Record<string, Set<string>> = {};

  for (const emp of employees) {
    const dept = emp.department || 'Other';
    deptEmployees[dept] = (deptEmployees[dept] || 0) + 1;
    if (!deptParticipants[dept]) {
      deptParticipants[dept] = new Set();
    }
  }

  const matchingRecords = await prisma.corporateMatchingRecord.findMany({
    where: {
      corporateAccountId,
      matchDate: { gte: startDate, lte: endDate },
    },
  });

  for (const record of matchingRecords) {
    const emp = employees.find((e) => e.userId === record.userId);
    const dept = emp?.department || 'Other';
    if (deptParticipants[dept]) {
      deptParticipants[dept].add(record.userId);
    }
  }

  const departmentStats = Object.keys(deptEmployees).map((dept) => ({
    department: dept,
    employees: deptEmployees[dept],
    participants: deptParticipants[dept]?.size || 0,
    participationRate: deptEmployees[dept] > 0
      ? ((deptParticipants[dept]?.size || 0) / deptEmployees[dept]) * 100
      : 0,
  }));

  // SDG alignment
  const sdgAlignment: Record<number, { name: string; color: string; amount: number }> = {};
  for (const [category, stats] of Object.entries(matchingStats.categoryBreakdown)) {
    const sdg = SDG_MAPPING[category];
    if (sdg) {
      if (!sdgAlignment[sdg.id]) {
        sdgAlignment[sdg.id] = { name: sdg.name, color: sdg.color, amount: 0 };
      }
      sdgAlignment[sdg.id].amount += stats.original + stats.matched;
    }
  }

  // Projects supported details
  const projectIds = matchingRecords
    .filter((r) => r.projectId)
    .map((r) => r.projectId as string);
  const uniqueProjectIds = [...new Set(projectIds)];

  const projects = await prisma.project.findMany({
    where: { id: { in: uniqueProjectIds } },
    select: {
      id: true,
      title: true,
      category: true,
      fundingRaised: true,
      fundingGoal: true,
    },
  });

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalEmployeeGiving: matchingStats.totalOriginal,
      totalMatchingFunds: matchingStats.totalMatched,
      totalImpact: matchingStats.totalCombined,
      uniqueEmployees: matchingStats.uniqueEmployees,
      projectsSupported: matchingStats.uniqueProjects,
      loansSupported: matchingStats.uniqueLoans,
      participationRate,
    },
    categoryBreakdown: matchingStats.categoryBreakdown,
    departmentStats,
    sdgAlignment: Object.entries(sdgAlignment).map(([id, data]) => ({
      sdgId: parseInt(id),
      ...data,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      funded: p.fundingRaised,
      goal: p.fundingGoal,
      percentComplete: p.fundingGoal > 0 ? (p.fundingRaised / p.fundingGoal) * 100 : 0,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// Create a report
export async function createReport(
  corporateAccountId: string,
  type: ReportType,
  startDate: Date,
  endDate: Date
) {
  const data = await generateReportData(corporateAccountId, startDate, endDate);

  return prisma.corporateReport.create({
    data: {
      corporateAccountId,
      type,
      startDate,
      endDate,
      data: JSON.stringify(data),
    },
  });
}

// Get report by ID
export async function getReport(id: string) {
  const report = await prisma.corporateReport.findUnique({
    where: { id },
    include: {
      corporateAccount: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
    },
  });

  if (report) {
    return {
      ...report,
      data: JSON.parse(report.data),
    };
  }

  return null;
}

// List reports for a corporate account
export async function listReports(
  corporateAccountId: string,
  options?: {
    type?: ReportType;
    limit?: number;
    offset?: number;
  }
) {
  const where: Record<string, unknown> = { corporateAccountId };

  if (options?.type) {
    where.type = options.type;
  }

  return prisma.corporateReport.findMany({
    where,
    orderBy: { generatedAt: 'desc' },
    take: options?.limit || 20,
    skip: options?.offset || 0,
  });
}

// Generate monthly report (helper)
export async function generateMonthlyReport(
  corporateAccountId: string,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return createReport(corporateAccountId, 'monthly', startDate, endDate);
}

// Generate quarterly report (helper)
export async function generateQuarterlyReport(
  corporateAccountId: string,
  year: number,
  quarter: number // 1-4
) {
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);

  return createReport(corporateAccountId, 'quarterly', startDate, endDate);
}

// Generate annual report (helper)
export async function generateAnnualReport(
  corporateAccountId: string,
  year: number
) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  return createReport(corporateAccountId, 'annual', startDate, endDate);
}
