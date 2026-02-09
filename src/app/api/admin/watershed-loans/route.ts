import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const loans = await prisma.watershedLoan.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      loans: loans.map((l) => ({
        id: l.id,
        userId: l.userId,
        userName: l.user.name || l.user.email || "Unknown",
        amount: l.amount,
        selfFundedAmount: l.selfFundedAmount,
        communityFundedAmount: l.communityFundedAmount,
        remainingBalance: l.remainingBalance,
        communityRemainingBalance: l.communityRemainingBalance,
        type: l.type,
        status: l.status,
        fundingLockActive: l.fundingLockActive,
        paymentsRemaining: l.paymentsRemaining,
        monthlyPayment: l.monthlyPayment,
        originationFee: l.originationFee,
        latePayments: l.latePayments,
        createdAt: l.createdAt,
        disbursedAt: l.disbursedAt,
        completedAt: l.completedAt,
        defaultedAt: l.defaultedAt,
      })),
    });
  } catch (error) {
    logError("api/admin/watershed-loans", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
