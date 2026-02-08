// Institution Reports
// Generate reports for institutions

import { prisma } from '@/lib/prisma';

export type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom';

export interface ReportData {
  period: string;
  generatedAt: string;
  summary: {
    totalUsers: number;
    newUsers: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalFunding: number;
    periodFunding: number;
    totalBackers: number;
    periodBackers: number;
  };
  projectBreakdown: Array<{
    id: string;
    title: string;
    category: string;
    fundingGoal: number;
    fundingRaised: number;
    backerCount: number;
    status: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    projectCount: number;
    funding: number;
  }>;
  topProjects: Array<{
    id: string;
    title: string;
    fundingRaised: number;
    backerCount: number;
  }>;
}

// Generate report data for institution
export async function generateInstitutionReport(
  institutionId: string,
  type: ReportType,
  period: string
): Promise<ReportData> {
  // Get date range based on type and period
  const dateRange = getDateRange(type, period);

  // This would aggregate real data from projects, users, etc.
  // For now, returning placeholder structure
  const reportData: ReportData = {
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalUsers: 0,
      newUsers: 0,
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalFunding: 0,
      periodFunding: 0,
      totalBackers: 0,
      periodBackers: 0,
    },
    projectBreakdown: [],
    categoryBreakdown: [],
    topProjects: [],
  };

  return reportData;
}

// Get date range for report type
function getDateRange(type: ReportType, period: string): { start: Date; end: Date } {
  const now = new Date();

  switch (type) {
    case 'monthly': {
      // period format: "2024-01"
      const [year, month] = period.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return { start, end };
    }
    case 'quarterly': {
      // period format: "2024-Q1"
      const [year, q] = period.split('-Q');
      const quarter = parseInt(q);
      const startMonth = (quarter - 1) * 3;
      const start = new Date(parseInt(year), startMonth, 1);
      const end = new Date(parseInt(year), startMonth + 3, 0);
      return { start, end };
    }
    case 'annual': {
      // period format: "2024"
      const year = parseInt(period);
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { start, end };
    }
    default:
      return { start: now, end: now };
  }
}

// Save generated report
export async function saveInstitutionReport(
  institutionId: string,
  type: ReportType,
  period: string,
  data: ReportData,
  pdfUrl?: string
) {
  return prisma.institutionReport.upsert({
    where: {
      institutionId_type_period: { institutionId, type, period },
    },
    create: {
      institutionId,
      type,
      period,
      data: JSON.stringify(data),
      pdfUrl,
    },
    update: {
      data: JSON.stringify(data),
      pdfUrl,
      generatedAt: new Date(),
    },
  });
}

// Get institution reports
export async function getInstitutionReports(
  institutionId: string,
  options?: { type?: ReportType; limit?: number }
) {
  const { type, limit = 12 } = options || {};

  const reports = await prisma.institutionReport.findMany({
    where: {
      institutionId,
      ...(type ? { type } : {}),
    },
    orderBy: { generatedAt: 'desc' },
    take: limit,
  });

  return reports.map((r) => ({
    ...r,
    data: JSON.parse(r.data) as ReportData,
  }));
}

// Get specific report
export async function getInstitutionReport(
  institutionId: string,
  type: ReportType,
  period: string
) {
  const report = await prisma.institutionReport.findUnique({
    where: {
      institutionId_type_period: { institutionId, type, period },
    },
  });

  if (!report) return null;

  return {
    ...report,
    data: JSON.parse(report.data) as ReportData,
  };
}

// Get available report periods
export function getAvailableReportPeriods(type: ReportType): string[] {
  const now = new Date();
  const periods: string[] = [];

  switch (type) {
    case 'monthly': {
      // Last 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
      }
      break;
    }
    case 'quarterly': {
      // Last 8 quarters
      for (let i = 0; i < 8; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periods.push(`${date.getFullYear()}-Q${quarter}`);
      }
      break;
    }
    case 'annual': {
      // Last 5 years
      for (let i = 0; i < 5; i++) {
        periods.push(String(now.getFullYear() - i));
      }
      break;
    }
  }

  return periods;
}
