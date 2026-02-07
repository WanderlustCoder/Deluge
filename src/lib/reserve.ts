import { prisma } from "@/lib/prisma";
import {
  RESERVE_HEALTHY_COVERAGE,
  RESERVE_WATCH_COVERAGE,
  RESERVE_CRITICAL_COVERAGE,
} from "@/lib/constants";

/**
 * Get or create the singleton PlatformReserve record.
 */
export async function getOrCreateReserve() {
  let reserve = await prisma.platformReserve.findFirst();
  if (!reserve) {
    reserve = await prisma.platformReserve.create({
      data: { balance: 0, totalInflow: 0, totalOutflow: 0, totalReplenished: 0 },
    });
  }
  return reserve;
}

/**
 * Accrue platform cut to reserve when a settlement clears.
 */
export async function accrueToReserve(amount: number, settlementId: string) {
  const reserve = await getOrCreateReserve();
  const newBalance = reserve.balance + amount;
  const newInflow = reserve.totalInflow + amount;

  await prisma.$transaction([
    prisma.platformReserve.update({
      where: { id: reserve.id },
      data: {
        balance: Math.round(newBalance * 100) / 100,
        totalInflow: Math.round(newInflow * 100) / 100,
      },
    }),
    prisma.reserveTransaction.create({
      data: {
        reserveId: reserve.id,
        type: "platform_cut_accrual",
        amount,
        balanceAfter: Math.round(newBalance * 100) / 100,
        referenceType: "settlement",
        referenceId: settlementId,
        description: "Platform cut accrued from cleared settlement",
      },
    }),
  ]);
}

/**
 * Debit reserve to front a project disbursement.
 */
export async function frontDisbursement(
  amount: number,
  disbursementId: string
) {
  const reserve = await getOrCreateReserve();
  if (reserve.balance < amount) {
    throw new Error("Insufficient reserve balance");
  }

  const newBalance = reserve.balance - amount;
  const newOutflow = reserve.totalOutflow + amount;

  await prisma.$transaction([
    prisma.platformReserve.update({
      where: { id: reserve.id },
      data: {
        balance: Math.round(newBalance * 100) / 100,
        totalOutflow: Math.round(newOutflow * 100) / 100,
      },
    }),
    prisma.reserveTransaction.create({
      data: {
        reserveId: reserve.id,
        type: "disbursement_fronted",
        amount: -amount,
        balanceAfter: Math.round(newBalance * 100) / 100,
        referenceType: "disbursement",
        referenceId: disbursementId,
        description: "Fronted disbursement to project",
      },
    }),
  ]);
}

/**
 * Manual admin adjustment to the reserve.
 */
export async function adjustReserve(amount: number, description: string) {
  const reserve = await getOrCreateReserve();
  const newBalance = reserve.balance + amount;

  const updateData: Record<string, number> = {
    balance: Math.round(newBalance * 100) / 100,
  };

  if (amount > 0) {
    updateData.totalReplenished =
      Math.round((reserve.totalReplenished + amount) * 100) / 100;
  }

  await prisma.$transaction([
    prisma.platformReserve.update({
      where: { id: reserve.id },
      data: updateData,
    }),
    prisma.reserveTransaction.create({
      data: {
        reserveId: reserve.id,
        type: "manual_adjustment",
        amount,
        balanceAfter: Math.round(newBalance * 100) / 100,
        description,
      },
    }),
  ]);

  return { newBalance: Math.round(newBalance * 100) / 100 };
}

/**
 * Reserve health metrics.
 */
export async function getReserveHealth() {
  const reserve = await getOrCreateReserve();

  // Pending disbursements = total pledged but not yet disbursed allocations
  const pendingAllocations = await prisma.allocation.aggregate({
    where: { status: "pledged" },
    _sum: { amount: true },
  });
  const pendingDisbursements = pendingAllocations._sum.amount || 0;

  // Coverage ratio: reserve balance vs pending disbursement obligations
  const coverageRatio =
    pendingDisbursements > 0 ? reserve.balance / pendingDisbursements : 999;

  let healthStatus: "healthy" | "watch" | "critical";
  if (coverageRatio >= RESERVE_HEALTHY_COVERAGE) {
    healthStatus = "healthy";
  } else if (coverageRatio >= RESERVE_WATCH_COVERAGE) {
    healthStatus = "watch";
  } else {
    healthStatus = "critical";
  }

  return {
    balance: reserve.balance,
    totalInflow: reserve.totalInflow,
    totalOutflow: reserve.totalOutflow,
    totalReplenished: reserve.totalReplenished,
    pendingDisbursements: Math.round(pendingDisbursements * 100) / 100,
    coverageRatio: Math.round(coverageRatio * 100) / 100,
    healthStatus,
  };
}
