import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import {
  checkWatershedLoanEligibility,
  determineLoanType,
  calculateOriginationFee,
  calculateMonthlyPayment,
  getMaxTermMonths,
  getFundingDeadlineDays,
  validateWatershedLoanApplication,
  getLendingPortfolioValue,
  SHARE_PRICE,
} from "@/lib/watershed-loans";
import { checkAndAwardBadges } from "@/lib/badges";

// GET: List user's watershed loans
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const loans = await prisma.watershedLoan.findMany({
      where: { userId: session.user.id },
      include: {
        shares: true,
        payments: { orderBy: { paidAt: "desc" }, take: 10 },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ loans });
  } catch (error) {
    logError("api/watershed-loans", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Apply for a watershed loan
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { amount, termMonths, purpose } = body as {
      amount: number;
      termMonths: number;
      purpose: string;
    };

    // Check eligibility
    const eligibility = await checkWatershedLoanEligibility(userId);
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.reason }, { status: 400 });
    }

    // Validate application
    const validation = validateWatershedLoanApplication({
      amount,
      termMonths,
      availableBalance: eligibility.availableBalance,
      purpose,
    });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine loan type
    const loanInfo = determineLoanType(amount, eligibility.availableBalance);
    const originationFee = calculateOriginationFee(loanInfo.communityFunded);
    const totalObligation = amount + originationFee;
    const monthlyPayment = calculateMonthlyPayment(totalObligation, termMonths);
    const portfolioValue = await getLendingPortfolioValue(userId);

    // Get watershed for transaction
    const watershed = await prisma.watershed.findUnique({ where: { userId } });
    if (!watershed) {
      return NextResponse.json({ error: "Watershed not found." }, { status: 400 });
    }

    if (loanInfo.type === "pure") {
      // --- PURE WATERSHED LOAN: Auto-approve and disburse ---
      const newBalance = watershed.balance - loanInfo.selfFunded;
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const totalShares = Math.ceil(amount / SHARE_PRICE);

      const loan = await prisma.$transaction(async (tx) => {
        // Create loan
        const newLoan = await tx.watershedLoan.create({
          data: {
            userId,
            amount,
            selfFundedAmount: loanInfo.selfFunded,
            communityFundedAmount: 0,
            remainingBalance: amount,
            communityRemainingBalance: 0,
            purpose,
            status: "active",
            type: "pure",
            originationFee: 0,
            monthlyPayment,
            termMonths,
            paymentsRemaining: termMonths,
            nextPaymentDate,
            fundingLockActive: false,
            portfolioValueAtOrigination: portfolioValue,
            disbursedAt: new Date(),
          },
        });

        // Create self-funded share
        await tx.watershedLoanShare.create({
          data: {
            loanId: newLoan.id,
            funderId: userId,
            count: totalShares,
            amount: loanInfo.selfFunded,
            isSelfFunded: true,
          },
        });

        // Deduct from watershed
        await tx.watershed.update({
          where: { userId },
          data: {
            balance: newBalance,
            totalOutflow: { increment: loanInfo.selfFunded },
          },
        });

        // Record transaction
        await tx.watershedTransaction.create({
          data: {
            watershedId: watershed.id,
            type: "watershed_loan",
            amount: -loanInfo.selfFunded,
            description: `Watershed loan: $${amount} (auto-approved)`,
            balanceAfter: newBalance,
          },
        });

        return newLoan;
      });

      checkAndAwardBadges(userId).catch(() => {});

      return NextResponse.json({
        success: true,
        loan: {
          id: loan.id,
          type: "pure",
          amount,
          status: "active",
          monthlyPayment,
          termMonths,
          nextPaymentDate,
        },
        message: "Your watershed loan has been approved and disbursed.",
      });
    } else {
      // --- WATERSHED-BACKED LOAN: Self-fund + enter community funding ---
      const newBalance = watershed.balance - loanInfo.selfFunded;
      const fundingDeadline = new Date();
      fundingDeadline.setDate(
        fundingDeadline.getDate() + getFundingDeadlineDays(loanInfo.communityFunded)
      );

      const selfFundedShares = Math.ceil(loanInfo.selfFunded / SHARE_PRICE);

      const loan = await prisma.$transaction(async (tx) => {
        // Create loan in funding status
        const newLoan = await tx.watershedLoan.create({
          data: {
            userId,
            amount,
            selfFundedAmount: loanInfo.selfFunded,
            communityFundedAmount: loanInfo.communityFunded,
            remainingBalance: amount + originationFee,
            communityRemainingBalance: loanInfo.communityFunded,
            purpose,
            status: "funding",
            type: "backed",
            originationFee,
            monthlyPayment,
            termMonths,
            paymentsRemaining: termMonths,
            fundingDeadline,
            fundingLockActive: true,
            portfolioValueAtOrigination: portfolioValue,
          },
        });

        // Create self-funded share (borrower is first funder)
        await tx.watershedLoanShare.create({
          data: {
            loanId: newLoan.id,
            funderId: userId,
            count: selfFundedShares,
            amount: loanInfo.selfFunded,
            isSelfFunded: true,
          },
        });

        // Deduct watershed balance
        await tx.watershed.update({
          where: { userId },
          data: {
            balance: newBalance,
            totalOutflow: { increment: loanInfo.selfFunded },
          },
        });

        // Record transaction
        await tx.watershedTransaction.create({
          data: {
            watershedId: watershed.id,
            type: "watershed_loan",
            amount: -loanInfo.selfFunded,
            description: `Watershed-backed loan: $${loanInfo.selfFunded} self-funded of $${amount} total`,
            balanceAfter: newBalance,
          },
        });

        return newLoan;
      });

      return NextResponse.json({
        success: true,
        loan: {
          id: loan.id,
          type: "backed",
          amount,
          selfFunded: loanInfo.selfFunded,
          communityFunded: loanInfo.communityFunded,
          originationFee,
          totalObligation,
          status: "funding",
          fundingDeadline,
          monthlyPayment,
          termMonths,
        },
        message: `Your watershed contributed $${loanInfo.selfFunded}. The remaining $${loanInfo.communityFunded} is now open for community funding.`,
      });
    }
  } catch (error) {
    logError("api/watershed-loans", error, { userId, route: "POST" });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
