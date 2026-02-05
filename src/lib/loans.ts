import { prisma } from "@/lib/prisma";
import { CREDIT_TIERS } from "@/lib/constants";

export function getTierConfig(tier: number) {
  return CREDIT_TIERS.find((t) => t.tier === tier) || CREDIT_TIERS[0];
}

export function getTierName(tier: number): string {
  const names: Record<number, string> = {
    1: "Starter",
    2: "Builder",
    3: "Established",
    4: "Trusted",
    5: "Champion",
  };
  return names[tier] || "Starter";
}

export async function calculateUserTier(userId: string): Promise<number> {
  const completedLoans = await prisma.loan.findMany({
    where: { borrowerId: userId, status: "completed" },
  });

  const totalCompleted = completedLoans.length;
  const totalLatePayments = completedLoans.reduce(
    (sum, l) => sum + l.latePayments,
    0
  );

  // Tier progression rules
  if (totalCompleted >= 5 && totalLatePayments === 0) return 5;
  if (totalCompleted >= 3 && totalLatePayments <= 2) return 4;
  if (totalCompleted >= 2 && totalLatePayments <= 1) return 3;
  if (totalCompleted >= 1) return 2;
  return 1;
}

export async function updateUserCreditTier(userId: string) {
  const newTier = await calculateUserTier(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const oldTier = user.creditTier;
  if (newTier === oldTier) return;

  const tierConfig = getTierConfig(newTier);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        creditTier: newTier,
        creditLimit: tierConfig.maxAmount,
        lastTierUpdate: new Date(),
      },
    }),
    prisma.loanTierHistory.create({
      data: {
        userId,
        fromTier: oldTier,
        toTier: newTier,
        reason:
          newTier > oldTier
            ? "Tier upgrade based on repayment history"
            : "Tier adjusted based on late payments",
      },
    }),
  ]);

  return { oldTier, newTier };
}
