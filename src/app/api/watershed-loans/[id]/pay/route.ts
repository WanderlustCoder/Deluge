import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { distributePaymentToShares } from "@/lib/watershed-loans";
import { checkAndAwardBadges } from "@/lib/badges";

// POST: Make a repayment on a watershed loan
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
    const { amount: requestedAmount, type = "scheduled" } = body as {
      amount?: number;
      type?: "scheduled" | "payoff";
    };

    const loan = await prisma.watershedLoan.findUnique({
      where: { id: loanId },
      include: { shares: true, payments: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    if (loan.userId !== userId) {
      return NextResponse.json({ error: "This is not your loan." }, { status: 403 });
    }

    if (!["active", "late", "at_risk", "recovering"].includes(loan.status)) {
      return NextResponse.json({ error: "This loan is not in a repayable status." }, { status: 400 });
    }

    // Calculate payment amount
    let paymentAmount: number;
    if (type === "payoff") {
      paymentAmount = loan.remainingBalance;
    } else {
      paymentAmount = requestedAmount || loan.monthlyPayment;
      paymentAmount = Math.min(paymentAmount, loan.remainingBalance);
    }

    if (paymentAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    // Distribute payment across shares (proportional FIFO)
    const shareData = loan.shares.map(s => ({
      id: s.id,
      amount: s.amount,
      repaid: s.repaid,
      isSelfFunded: s.isSelfFunded,
    }));
    const distribution = distributePaymentToShares(paymentAmount, shareData);

    const isFullyPaid = loan.remainingBalance - paymentAmount <= 0.01;
    const newRemainingBalance = isFullyPaid ? 0 : loan.remainingBalance - paymentAmount;
    const newCommunityRemaining = Math.max(
      0,
      loan.communityRemainingBalance - distribution.appliedToCommunity
    );
    const communityFullyRepaid = newCommunityRemaining <= 0.01 && loan.communityFundedAmount > 0;

    // Calculate next payment date
    const nextPaymentDate = isFullyPaid
      ? null
      : (() => {
          const next = new Date();
          next.setMonth(next.getMonth() + 1);
          return next;
        })();

    await prisma.$transaction(async (tx) => {
      // Record payment
      await tx.watershedLoanPayment.create({
        data: {
          watershedLoanId: loanId,
          payerId: userId,
          amount: paymentAmount,
          type,
          appliedToCommunity: distribution.appliedToCommunity,
          appliedToSelf: distribution.appliedToSelf,
        },
      });

      // Update share repaid amounts
      for (const dist of distribution.distributions) {
        await tx.watershedLoanShare.update({
          where: { id: dist.shareId },
          data: { repaid: { increment: dist.amount } },
        });
      }

      // Credit community funders' watersheds
      for (const share of loan.shares) {
        if (share.isSelfFunded) continue;
        const dist = distribution.distributions.find(d => d.shareId === share.id);
        if (!dist || dist.amount <= 0) continue;

        const funderWatershed = await tx.watershed.findUnique({
          where: { userId: share.funderId },
        });
        if (funderWatershed) {
          const newBalance = funderWatershed.balance + dist.amount;
          await tx.watershed.update({
            where: { userId: share.funderId },
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
              description: `Watershed loan repayment received: $${dist.amount.toFixed(2)}`,
              balanceAfter: newBalance,
            },
          });
        }
      }

      // Credit borrower's watershed for self-funded portion (restoration)
      if (distribution.appliedToSelf > 0) {
        const borrowerWatershed = await tx.watershed.findUnique({
          where: { userId },
        });
        if (borrowerWatershed) {
          const newBalance = borrowerWatershed.balance + distribution.appliedToSelf;
          await tx.watershed.update({
            where: { userId },
            data: {
              balance: newBalance,
              totalInflow: { increment: distribution.appliedToSelf },
            },
          });
          await tx.watershedTransaction.create({
            data: {
              watershedId: borrowerWatershed.id,
              type: "loan_repayment",
              amount: distribution.appliedToSelf,
              description: `Watershed restored: $${distribution.appliedToSelf.toFixed(2)}`,
              balanceAfter: newBalance,
            },
          });
        }
      }

      // Update loan status
      const updateData: Record<string, unknown> = {
        remainingBalance: newRemainingBalance,
        communityRemainingBalance: newCommunityRemaining <= 0.01 ? 0 : newCommunityRemaining,
        paymentsRemaining: isFullyPaid ? 0 : loan.paymentsRemaining - 1,
        nextPaymentDate,
      };

      if (isFullyPaid) {
        updateData.status = "completed";
        updateData.completedAt = new Date();
        updateData.fundingLockActive = false;
      } else if (communityFullyRepaid && !loan.communityRepaidAt) {
        updateData.communityRepaidAt = new Date();
        updateData.fundingLockActive = false;
        updateData.communityRemainingBalance = 0;
      }

      // Recovery tracking
      if (loan.status === "recovering") {
        const newRecoveryPayments = loan.recoveryPayments + 1;
        updateData.recoveryPayments = newRecoveryPayments;
        if (newRecoveryPayments >= 3) {
          updateData.status = "active";
          updateData.recoveryStartedAt = null;
          updateData.recoveryPayments = 0;
        }
      }

      // Reset status from late/at_risk to active on payment
      if (["late", "at_risk"].includes(loan.status) && !isFullyPaid) {
        updateData.status = "active";
      }

      await tx.watershedLoan.update({
        where: { id: loanId },
        data: updateData,
      });
    });

    checkAndAwardBadges(userId).catch(() => {});

    return NextResponse.json({
      success: true,
      payment: {
        amount: paymentAmount,
        appliedToCommunity: distribution.appliedToCommunity,
        appliedToSelf: distribution.appliedToSelf,
      },
      loan: {
        remainingBalance: newRemainingBalance,
        communityRemainingBalance: newCommunityRemaining <= 0.01 ? 0 : newCommunityRemaining,
        isCompleted: isFullyPaid,
        communityFullyRepaid,
        fundingLockLifted: communityFullyRepaid || isFullyPaid,
      },
      message: isFullyPaid
        ? "Congratulations! Your watershed loan is fully repaid. Your watershed has been restored."
        : communityFullyRepaid
          ? "Your community funders have been fully repaid. Thank you for honoring their trust. Your funding lock has been lifted."
          : `Payment of $${paymentAmount.toFixed(2)} recorded successfully.`,
    });
  } catch (error) {
    logError("api/watershed-loans/[id]/pay", error, { userId });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
