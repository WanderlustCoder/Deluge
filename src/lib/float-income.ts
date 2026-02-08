/**
 * Float Income Tracking
 *
 * Tracks custodial float - interest earned on aggregate watershed balances.
 * At scale: $11.25M pool @ 4.5% = $506K/year
 *
 * User principal is always protected and always available.
 * The interest belongs to Deluge - standard practice, but we're transparent about it.
 */

import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

// Default interest rate assumption (can be configured)
const DEFAULT_ANNUAL_RATE = 0.045; // 4.5% APY

/**
 * Capture a daily snapshot of float balances
 */
export async function captureFloatSnapshot(
  date: Date = new Date(),
  interestRate: number = DEFAULT_ANNUAL_RATE
): Promise<{ totalWatersheds: number; dailyInterest: number }> {
  try {
    // Get total of all watershed balances
    const watershedAgg = await prisma.watershed.aggregate({
      _sum: { balance: true },
    });
    const totalWatersheds = watershedAgg._sum.balance || 0;

    // Get platform reserve balance
    const reserve = await prisma.platformReserve.findFirst();
    const totalReserve = reserve?.balance || 0;

    // Calculate daily interest (annual rate / 365)
    const dailyRate = interestRate / 365;
    const dailyInterest = totalWatersheds * dailyRate;

    // Create snapshot
    await prisma.floatSnapshot.upsert({
      where: { date: startOfDay(date) },
      update: {
        totalWatersheds,
        totalReserve,
        interestRate,
        dailyInterest,
      },
      create: {
        date: startOfDay(date),
        totalWatersheds,
        totalReserve,
        interestRate,
        dailyInterest,
      },
    });

    logInfo("float-income", "Captured float snapshot", {
      date: date.toISOString(),
      totalWatersheds,
      dailyInterest,
    });

    return { totalWatersheds, dailyInterest };
  } catch (error) {
    logError("float-income", error, { action: "capture-snapshot" });
    throw error;
  }
}

/**
 * Calculate daily interest and record as revenue
 */
export async function calculateDailyInterest(
  date: Date = new Date()
): Promise<{ dailyInterest: number }> {
  try {
    // Get today's snapshot
    const snapshot = await prisma.floatSnapshot.findUnique({
      where: { date: startOfDay(date) },
    });

    if (!snapshot) {
      // Create snapshot first
      const result = await captureFloatSnapshot(date);
      return { dailyInterest: result.dailyInterest };
    }

    // Record as revenue
    const { recordRevenue } = await import("./revenue-tracking");
    await recordRevenue({
      date,
      source: "float",
      amount: snapshot.dailyInterest,
    });

    // Distribute float contribution to watersheds proportionally
    await distributeFloatContribution(snapshot.totalWatersheds, snapshot.dailyInterest);

    return { dailyInterest: snapshot.dailyInterest };
  } catch (error) {
    logError("float-income", error, { action: "calculate-interest" });
    throw error;
  }
}

/**
 * Distribute float contribution tracking to watersheds
 * This is for transparency - shows how much each user's balance contributed
 */
async function distributeFloatContribution(
  totalWatersheds: number,
  dailyInterest: number
): Promise<void> {
  if (totalWatersheds <= 0) return;

  // Get all watersheds with positive balance
  const watersheds = await prisma.watershed.findMany({
    where: { balance: { gt: 0 } },
    select: { id: true, balance: true },
  });

  // Update each watershed's float contribution proportionally
  for (const ws of watersheds) {
    const proportion = ws.balance / totalWatersheds;
    const contribution = dailyInterest * proportion;

    await prisma.watershed.update({
      where: { id: ws.id },
      data: { floatContributed: { increment: contribution } },
    });
  }
}

/**
 * Get float metrics for transparency page
 */
export async function getFloatMetrics(): Promise<{
  currentTotal: number;
  currentRate: number;
  projectedAnnual: number;
  last30DaysInterest: number;
  totalHistorical: number;
  snapshots: {
    date: Date;
    totalWatersheds: number;
    dailyInterest: number;
  }[];
}> {
  // Get latest snapshot
  const latest = await prisma.floatSnapshot.findFirst({
    orderBy: { date: "desc" },
  });

  // Get last 30 days of snapshots
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSnapshots = await prisma.floatSnapshot.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  });

  const last30DaysInterest = recentSnapshots.reduce(
    (sum, s) => sum + s.dailyInterest,
    0
  );

  // Get total historical float revenue
  const floatRevenue = await prisma.revenueRecord.aggregate({
    where: { source: "float" },
    _sum: { amount: true },
  });

  return {
    currentTotal: latest?.totalWatersheds || 0,
    currentRate: latest?.interestRate || DEFAULT_ANNUAL_RATE,
    projectedAnnual: (latest?.dailyInterest || 0) * 365,
    last30DaysInterest,
    totalHistorical: floatRevenue._sum.amount || 0,
    snapshots: recentSnapshots.map((s) => ({
      date: s.date,
      totalWatersheds: s.totalWatersheds,
      dailyInterest: s.dailyInterest,
    })),
  };
}

/**
 * Get a user's float contribution stats
 */
export async function getUserFloatContribution(userId: string): Promise<{
  currentBalance: number;
  totalContributed: number;
  percentOfTotal: number;
}> {
  const watershed = await prisma.watershed.findUnique({
    where: { userId },
    select: { balance: true, floatContributed: true },
  });

  const totalWatersheds = await prisma.watershed.aggregate({
    _sum: { balance: true },
  });

  const total = totalWatersheds._sum.balance || 0;
  const balance = watershed?.balance || 0;

  return {
    currentBalance: balance,
    totalContributed: watershed?.floatContributed || 0,
    percentOfTotal: total > 0 ? (balance / total) * 100 : 0,
  };
}

// --- Helpers ---

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
