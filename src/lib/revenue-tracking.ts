/**
 * Revenue Tracking
 *
 * Tracks all platform revenue by source for transparency reporting.
 */

import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

export type RevenueSource =
  | "ads"
  | "directory"
  | "float"
  | "corporate"
  | "loans"
  | "cascade_sponsor"
  | "notification_sponsor";

export interface RevenueData {
  date: Date;
  source: RevenueSource;
  amount: number;
  adViewCount?: number;
  businessCount?: number;
  loanVolume?: number;
}

/**
 * Record a revenue event
 */
export async function recordRevenue(data: RevenueData): Promise<void> {
  try {
    await prisma.revenueRecord.create({
      data: {
        date: data.date,
        source: data.source,
        amount: data.amount,
        adViewCount: data.adViewCount,
        businessCount: data.businessCount,
        loanVolume: data.loanVolume,
      },
    });

    logInfo("revenue-tracking", "Revenue recorded", {
      source: data.source,
      amount: data.amount,
    });
  } catch (error) {
    logError("revenue-tracking", error, { action: "record-revenue" });
    throw error;
  }
}

/**
 * Get revenue breakdown for a date range
 */
export async function getRevenueBreakdown(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  bySource: Record<RevenueSource, number>;
  byDate: { date: string; amount: number }[];
}> {
  const records = await prisma.revenueRecord.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  const bySource: Record<string, number> = {};
  const byDateMap: Record<string, number> = {};
  let total = 0;

  for (const record of records) {
    total += record.amount;
    bySource[record.source] = (bySource[record.source] || 0) + record.amount;

    const dateKey = record.date.toISOString().split("T")[0];
    byDateMap[dateKey] = (byDateMap[dateKey] || 0) + record.amount;
  }

  const byDate = Object.entries(byDateMap).map(([date, amount]) => ({
    date,
    amount,
  }));

  return {
    total,
    bySource: bySource as Record<RevenueSource, number>,
    byDate,
  };
}

/**
 * Get revenue trends for display
 */
export async function getRevenueTrends(
  period: "week" | "month" | "quarter" | "year"
): Promise<{
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "flat";
  bySource: Record<RevenueSource, { current: number; previous: number }>;
}> {
  const now = new Date();
  let periodDays: number;

  switch (period) {
    case "week":
      periodDays = 7;
      break;
    case "month":
      periodDays = 30;
      break;
    case "quarter":
      periodDays = 90;
      break;
    case "year":
      periodDays = 365;
      break;
  }

  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - periodDays);

  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - periodDays);

  const [currentData, previousData] = await Promise.all([
    getRevenueBreakdown(currentStart, now),
    getRevenueBreakdown(previousStart, currentStart),
  ]);

  const change = currentData.total - previousData.total;
  const changePercent =
    previousData.total > 0 ? (change / previousData.total) * 100 : 0;

  const sources: RevenueSource[] = [
    "ads",
    "directory",
    "float",
    "corporate",
    "loans",
    "cascade_sponsor",
    "notification_sponsor",
  ];

  const bySource = {} as Record<
    RevenueSource,
    { current: number; previous: number }
  >;
  for (const source of sources) {
    bySource[source] = {
      current: currentData.bySource[source] || 0,
      previous: previousData.bySource[source] || 0,
    };
  }

  return {
    current: currentData.total,
    previous: previousData.total,
    change,
    changePercent,
    trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
    bySource,
  };
}

/**
 * Get public transparency metrics
 */
export async function getPublicTransparencyMetrics(): Promise<{
  totalFunded: number;
  totalLoansIssued: number;
  activeUsers: number;
  revenueBySource: Record<RevenueSource, number>;
  monthlyRevenue: number;
  platformTake: string; // "40%"
}> {
  // Total funded to projects
  const projectFunding = await prisma.project.aggregate({
    _sum: { fundingRaised: true },
  });

  // Total loans issued
  const loans = await prisma.loan.aggregate({
    where: { status: { in: ["active", "repaying", "completed"] } },
    _sum: { amount: true },
  });

  // Active users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await prisma.user.count({
    where: {
      OR: [
        { adViews: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { allocations: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { contributions: { some: { createdAt: { gte: thirtyDaysAgo } } } },
      ],
    },
  });

  // Monthly revenue breakdown
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const breakdown = await getRevenueBreakdown(monthStart, new Date());

  return {
    totalFunded: projectFunding._sum.fundingRaised || 0,
    totalLoansIssued: loans._sum.amount || 0,
    activeUsers,
    revenueBySource: breakdown.bySource,
    monthlyRevenue: breakdown.total,
    platformTake: "40%", // From business constants
  };
}

/**
 * Record cost entry
 */
export async function recordCost(data: {
  date: Date;
  category: string;
  description: string;
  amount: number;
}): Promise<void> {
  await prisma.costRecord.create({
    data: {
      date: data.date,
      category: data.category,
      description: data.description,
      amount: data.amount,
    },
  });

  logInfo("revenue-tracking", "Cost recorded", {
    category: data.category,
    amount: data.amount,
  });
}

/**
 * Get costs for a period
 */
export async function getCosts(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  byCategory: Record<string, number>;
  items: { date: Date; category: string; description: string; amount: number }[];
}> {
  const costs = await prisma.costRecord.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "desc" },
  });

  const byCategory: Record<string, number> = {};
  let total = 0;

  for (const cost of costs) {
    total += cost.amount;
    byCategory[cost.category] = (byCategory[cost.category] || 0) + cost.amount;
  }

  return {
    total,
    byCategory,
    items: costs.map((c) => ({
      date: c.date,
      category: c.category,
      description: c.description,
      amount: c.amount,
    })),
  };
}
