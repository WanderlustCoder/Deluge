import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// POST: Voluntarily accelerate community repayment from watershed balance
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { id: loanId } = await params;
    const body = await request.json();
    const { amount } = body as { amount: number };

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const loan = await prisma.watershedLoan.findUnique({
      where: { id: loanId },
      include: { shares: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    if (loan.userId !== userId) {
      return NextResponse.json({ error: "This is not your loan." }, { status: 403 });
    }

    if (loan.type !== "backed") {
      return NextResponse.json(
        { error: "Voluntary acceleration is only available for watershed-backed loans." },
        { status: 400 }
      );
    }

    if (!loan.fundingLockActive || loan.communityRemainingBalance <= 0) {
      return NextResponse.json(
        { error: "Community funders have already been repaid." },
        { status: 400 }
      );
    }

    if (!["active", "late", "at_risk", "recovering"].includes(loan.status)) {
      return NextResponse.json(
        { error: "Loan is not in an accelerable status." },
        { status: 400 }
      );
    }

    // Check borrower's watershed balance
    const watershed = await prisma.watershed.findUnique({
      where: { userId },
    });

    if (!watershed || watershed.balance <= 0) {
      return NextResponse.json(
        { error: "No watershed balance available for acceleration." },
        { status: 400 }
      );
    }

    // Cap at available balance and community remaining
    const actualAmount = Math.min(amount, watershed.balance, loan.communityRemainingBalance);

    if (actualAmount <= 0) {
      return NextResponse.json({ error: "No funds available to accelerate." }, { status: 400 });
    }

    // Distribute acceleration to community shares only
    const communityShares = loan.shares.filter(s => !s.isSelfFunded);
    const totalCommunityOutstanding = communityShares.reduce(
      (sum, s) => sum + (s.amount - s.repaid),
      0
    );

    if (totalCommunityOutstanding <= 0) {
      return NextResponse.json(
        { error: "Community funders have already been repaid." },
        { status: 400 }
      );
    }

    const distributions: Array<{ shareId: string; funderId: string; amount: number }> = [];
    for (const share of communityShares) {
      const outstanding = share.amount - share.repaid;
      if (outstanding <= 0) continue;
      const proportion = outstanding / totalCommunityOutstanding;
      const credit = Math.min(
        Math.round(actualAmount * proportion * 100) / 100,
        outstanding
      );
      distributions.push({ shareId: share.id, funderId: share.funderId, amount: credit });
    }

    const newCommunityRemaining = loan.communityRemainingBalance - actualAmount;
    const communityFullyRepaid = newCommunityRemaining <= 0.01;
    const newWatershedBalance = watershed.balance - actualAmount;
    const newRemainingBalance = loan.remainingBalance - actualAmount;
    const isFullyPaid = newRemainingBalance <= 0.01;

    await prisma.$transaction(async (tx) => {
      // Record acceleration payment
      await tx.watershedLoanPayment.create({
        data: {
          watershedLoanId: loanId,
          payerId: userId,
          amount: actualAmount,
          type: "acceleration",
          appliedToCommunity: actualAmount,
          appliedToSelf: 0,
        },
      });

      // Deduct from borrower's watershed
      await tx.watershed.update({
        where: { userId },
        data: {
          balance: newWatershedBalance,
          totalOutflow: { increment: actualAmount },
        },
      });

      await tx.watershedTransaction.create({
        data: {
          watershedId: watershed.id,
          type: "loan_repayment_out",
          amount: -actualAmount,
          description: `Voluntary acceleration: $${actualAmount.toFixed(2)} directed to community funders`,
          balanceAfter: newWatershedBalance,
        },
      });

      // Credit community funders
      for (const dist of distributions) {
        await tx.watershedLoanShare.update({
          where: { id: dist.shareId },
          data: { repaid: { increment: dist.amount } },
        });

        const funderWatershed = await tx.watershed.findUnique({
          where: { userId: dist.funderId },
        });
        if (funderWatershed) {
          const newBalance = funderWatershed.balance + dist.amount;
          await tx.watershed.update({
            where: { userId: dist.funderId },
            data: {
              balance: newBalance,
              totalInflow: { increment: dist.amount },
            },
          });
          await tx.watershedTransaction.create({
            data: {
              watershedId: funderWatershed.id,
              type: "loan_repayment",
              amount: dist.amount,
              description: `Watershed loan acceleration received: $${dist.amount.toFixed(2)}`,
              balanceAfter: newBalance,
            },
          });
        }
      }

      // Update loan
      const updateData: Record<string, unknown> = {
        remainingBalance: isFullyPaid ? 0 : newRemainingBalance,
        communityRemainingBalance: communityFullyRepaid ? 0 : newCommunityRemaining,
      };

      if (isFullyPaid) {
        updateData.status = "completed";
        updateData.completedAt = new Date();
        updateData.fundingLockActive = false;
      } else if (communityFullyRepaid) {
        updateData.communityRepaidAt = new Date();
        updateData.fundingLockActive = false;
      }

      await tx.watershedLoan.update({
        where: { id: loanId },
        data: updateData,
      });
    });

    return NextResponse.json({
      success: true,
      amount: actualAmount,
      communityFullyRepaid,
      isCompleted: isFullyPaid,
      newCommunityRemaining: communityFullyRepaid ? 0 : newCommunityRemaining,
      message: communityFullyRepaid
        ? "Your community funders have been fully repaid! Thank you for honoring their trust. Your funding lock has been lifted."
        : `You directed $${actualAmount.toFixed(2)} from your watershed toward your community funders. Thank you for honoring their trust.`,
    });
  } catch (error) {
    logError("api/watershed-loans/[id]/accelerate", error, { userId });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
