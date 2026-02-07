import { prisma } from "@/lib/prisma";
import { SETTLEMENT_NET_TERM_DAYS } from "@/lib/constants";
import { accrueToReserve } from "@/lib/reserve";

/**
 * Create a settlement batch from unsettled (pending, no settlement) AdViews.
 */
export async function createSettlementBatch(options?: {
  beforeDate?: Date;
  notes?: string;
}) {
  const where: Record<string, unknown> = {
    settlementStatus: "pending",
    settlementId: null,
  };
  if (options?.beforeDate) {
    where.createdAt = { lte: options.beforeDate };
  }

  const adViews = await prisma.adView.findMany({ where });

  if (adViews.length === 0) return null;

  const totalGross = adViews.reduce((s, a) => s + a.grossRevenue, 0);
  const totalPlatformCut = adViews.reduce((s, a) => s + a.platformCut, 0);
  const totalWatershedCredit = adViews.reduce(
    (s, a) => s + a.watershedCredit,
    0
  );

  const expectedClearDate = new Date();
  expectedClearDate.setDate(
    expectedClearDate.getDate() + SETTLEMENT_NET_TERM_DAYS
  );

  const settlement = await prisma.revenueSettlement.create({
    data: {
      totalGross: Math.round(totalGross * 100) / 100,
      totalPlatformCut: Math.round(totalPlatformCut * 100) / 100,
      totalWatershedCredit: Math.round(totalWatershedCredit * 100) / 100,
      adViewCount: adViews.length,
      netTermDays: SETTLEMENT_NET_TERM_DAYS,
      expectedClearDate,
      notes: options?.notes ?? null,
    },
  });

  // Link ad views to this settlement
  await prisma.adView.updateMany({
    where: { id: { in: adViews.map((a) => a.id) } },
    data: { settlementId: settlement.id },
  });

  return settlement;
}

/**
 * Mark a settlement batch as cleared, accrue platform cut to reserve.
 */
export async function clearSettlement(id: string, providerRef?: string) {
  const settlement = await prisma.revenueSettlement.findUnique({
    where: { id },
  });
  if (!settlement || settlement.status === "cleared") return settlement;

  const updated = await prisma.revenueSettlement.update({
    where: { id },
    data: {
      status: "cleared",
      clearedAt: new Date(),
      providerRef: providerRef ?? null,
    },
  });

  // Mark all ad views in this batch as cleared
  await prisma.adView.updateMany({
    where: { settlementId: id },
    data: { settlementStatus: "cleared" },
  });

  // Accrue platform cut to reserve
  await accrueToReserve(settlement.totalPlatformCut, settlement.id);

  return updated;
}

/**
 * Summary stats for admin dashboard.
 */
export async function getSettlementStats() {
  const [pending, cleared, all] = await Promise.all([
    prisma.revenueSettlement.aggregate({
      where: { status: "pending" },
      _sum: { totalGross: true, totalPlatformCut: true },
      _count: { id: true },
    }),
    prisma.revenueSettlement.aggregate({
      where: { status: "cleared" },
      _sum: { totalGross: true, totalPlatformCut: true },
      _count: { id: true },
    }),
    prisma.revenueSettlement.findFirst({
      where: { status: "pending" },
      orderBy: { expectedClearDate: "asc" },
      select: { expectedClearDate: true },
    }),
  ]);

  return {
    pendingTotal: Math.round((pending._sum.totalGross || 0) * 100) / 100,
    pendingPlatformCut:
      Math.round((pending._sum.totalPlatformCut || 0) * 100) / 100,
    pendingCount: pending._count.id,
    clearedTotal: Math.round((cleared._sum.totalGross || 0) * 100) / 100,
    clearedPlatformCut:
      Math.round((cleared._sum.totalPlatformCut || 0) * 100) / 100,
    clearedCount: cleared._count.id,
    nextExpectedClearDate: all?.expectedClearDate ?? null,
  };
}

/**
 * Pending vs cleared revenue totals (for analytics).
 */
export async function getPendingRevenueSummary() {
  const [pendingAgg, clearedAgg] = await Promise.all([
    prisma.adView.aggregate({
      where: { settlementStatus: "pending" },
      _sum: { grossRevenue: true, platformCut: true, watershedCredit: true },
      _count: { id: true },
    }),
    prisma.adView.aggregate({
      where: { settlementStatus: "cleared" },
      _sum: { grossRevenue: true, platformCut: true, watershedCredit: true },
      _count: { id: true },
    }),
  ]);

  return {
    pending: {
      gross: Math.round((pendingAgg._sum.grossRevenue || 0) * 100) / 100,
      platformCut:
        Math.round((pendingAgg._sum.platformCut || 0) * 100) / 100,
      watershedCredit:
        Math.round((pendingAgg._sum.watershedCredit || 0) * 100) / 100,
      count: pendingAgg._count.id,
    },
    cleared: {
      gross: Math.round((clearedAgg._sum.grossRevenue || 0) * 100) / 100,
      platformCut:
        Math.round((clearedAgg._sum.platformCut || 0) * 100) / 100,
      watershedCredit:
        Math.round((clearedAgg._sum.watershedCredit || 0) * 100) / 100,
      count: clearedAgg._count.id,
    },
  };
}
