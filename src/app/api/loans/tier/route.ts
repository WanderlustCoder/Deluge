import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTierConfig, getTierName } from "@/lib/loans";
import { logError } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditTier: true, creditLimit: true, lastTierUpdate: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const completedLoans = await prisma.loan.findMany({
      where: { borrowerId: session.user.id, status: "completed" },
    });

    const totalCompleted = completedLoans.length;
    const totalLatePayments = completedLoans.reduce(
      (sum, l) => sum + l.latePayments,
      0
    );

    const tierConfig = getTierConfig(user.creditTier);
    const tierName = getTierName(user.creditTier);

    return NextResponse.json({
      tier: user.creditTier,
      tierName,
      creditLimit: user.creditLimit,
      maxAmount: tierConfig.maxAmount,
      maxMonths: tierConfig.maxMonths,
      deadlineDays: tierConfig.deadlineDays,
      completedLoans: totalCompleted,
      latePayments: totalLatePayments,
      lastTierUpdate: user.lastTierUpdate,
    });
  } catch (error) {
    logError("api/loans/tier", error, {
      userId: session.user.id,
      route: "GET /api/loans/tier",
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
