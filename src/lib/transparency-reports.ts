/**
 * Transparency Reports
 *
 * Generates quarterly and annual transparency reports.
 */

import { prisma } from "@/lib/prisma";
import { getRevenueBreakdown, getCosts } from "./revenue-tracking";
import { logInfo, logError } from "@/lib/logger";

export type PeriodType = "quarterly" | "annual";

/**
 * Generate a transparency report for a period
 */
export async function generateTransparencyReport(
  period: string, // "2026-Q1" or "2026"
  periodType: PeriodType
): Promise<{ reportId: string }> {
  try {
    const { startDate, endDate } = getPeriodDates(period, periodType);

    // Get revenue breakdown
    const revenue = await getRevenueBreakdown(startDate, endDate);

    // Get costs
    const costs = await getCosts(startDate, endDate);

    // Calculate net margin
    const netMargin = revenue.total - costs.total;

    // Get funding stats
    const projectFunding = await prisma.allocation.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const loanStats = await prisma.loan.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ["active", "repaying", "completed"] },
      },
      _sum: { amount: true },
    });

    // Get active users
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { adViews: { some: { createdAt: { gte: startDate, lte: endDate } } } },
          { allocations: { some: { createdAt: { gte: startDate, lte: endDate } } } },
        ],
      },
    });

    // Create or update report
    const report = await prisma.transparencyReport.upsert({
      where: {
        period_periodType: { period, periodType },
      },
      update: {
        totalRevenue: revenue.total,
        totalCosts: costs.total,
        netMargin,
        revenueBreakdown: JSON.stringify(revenue.bySource),
        totalFunded: projectFunding._sum.amount || 0,
        totalLoansIssued: loanStats._sum.amount || 0,
        totalUsersActive: activeUsers,
      },
      create: {
        period,
        periodType,
        totalRevenue: revenue.total,
        totalCosts: costs.total,
        netMargin,
        revenueBreakdown: JSON.stringify(revenue.bySource),
        totalFunded: projectFunding._sum.amount || 0,
        totalLoansIssued: loanStats._sum.amount || 0,
        totalUsersActive: activeUsers,
      },
    });

    logInfo("transparency-reports", "Report generated", {
      period,
      periodType,
      reportId: report.id,
    });

    return { reportId: report.id };
  } catch (error) {
    logError("transparency-reports", error, { period, periodType });
    throw error;
  }
}

/**
 * Publish a report (make it publicly visible)
 */
export async function publishReport(reportId: string): Promise<void> {
  await prisma.transparencyReport.update({
    where: { id: reportId },
    data: { publishedAt: new Date() },
  });

  logInfo("transparency-reports", "Report published", { reportId });
}

/**
 * Get published reports
 */
export async function getPublishedReports(limit = 10): Promise<
  {
    id: string;
    period: string;
    periodType: string;
    totalRevenue: number;
    totalCosts: number;
    netMargin: number;
    totalFunded: number;
    totalUsersActive: number;
    publishedAt: Date;
    pdfUrl: string | null;
  }[]
> {
  const reports = await prisma.transparencyReport.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return reports.map((r) => ({
    id: r.id,
    period: r.period,
    periodType: r.periodType,
    totalRevenue: r.totalRevenue,
    totalCosts: r.totalCosts,
    netMargin: r.netMargin,
    totalFunded: r.totalFunded,
    totalUsersActive: r.totalUsersActive,
    publishedAt: r.publishedAt!,
    pdfUrl: r.pdfUrl,
  }));
}

/**
 * Get a specific report
 */
export async function getReport(reportId: string) {
  const report = await prisma.transparencyReport.findUnique({
    where: { id: reportId },
  });

  if (!report) return null;

  return {
    ...report,
    revenueBreakdown: JSON.parse(report.revenueBreakdown || "{}"),
  };
}

/**
 * Get all reports (for admin)
 */
export async function getAllReports() {
  return prisma.transparencyReport.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update report with PDF URL
 */
export async function setReportPdfUrl(
  reportId: string,
  pdfUrl: string
): Promise<void> {
  await prisma.transparencyReport.update({
    where: { id: reportId },
    data: { pdfUrl },
  });
}

// --- Helpers ---

function getPeriodDates(
  period: string,
  periodType: PeriodType
): { startDate: Date; endDate: Date } {
  if (periodType === "annual") {
    // Period is like "2026"
    const year = parseInt(period);
    return {
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31, 23, 59, 59),
    };
  }

  // Period is like "2026-Q1"
  const [yearStr, quarterStr] = period.split("-");
  const year = parseInt(yearStr);
  const quarter = parseInt(quarterStr.replace("Q", ""));

  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;

  return {
    startDate: new Date(year, startMonth, 1),
    endDate: new Date(year, endMonth + 1, 0, 23, 59, 59), // Last day of quarter
  };
}

/**
 * Get the current quarter string
 */
export function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${quarter}`;
}

/**
 * Get the previous quarter string
 */
export function getPreviousQuarter(): string {
  const now = new Date();
  let quarter = Math.ceil((now.getMonth() + 1) / 3) - 1;
  let year = now.getFullYear();

  if (quarter === 0) {
    quarter = 4;
    year -= 1;
  }

  return `${year}-Q${quarter}`;
}
