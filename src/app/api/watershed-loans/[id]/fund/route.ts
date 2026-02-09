import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { SHARE_PRICE } from "@/lib/constants";

// POST: Fund a watershed-backed loan (community funder)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const funderId = session.user.id;

  try {
    const { id: loanId } = await params;
    const body = await request.json();
    const { amount } = body as { amount: number };

    if (!amount || amount < SHARE_PRICE) {
      return NextResponse.json(
        { error: `Minimum funding amount is $${SHARE_PRICE}.` },
        { status: 400 }
      );
    }

    // Get loan
    const loan = await prisma.watershedLoan.findUnique({
      where: { id: loanId },
      include: { shares: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    if (loan.status !== "funding") {
      return NextResponse.json({ error: "This loan is not accepting funding." }, { status: 400 });
    }

    if (loan.userId === funderId) {
      return NextResponse.json({ error: "You cannot fund your own loan." }, { status: 400 });
    }

    // Check funding deadline
    if (loan.fundingDeadline && new Date() > loan.fundingDeadline) {
      return NextResponse.json({ error: "Funding deadline has passed." }, { status: 400 });
    }

    // Calculate remaining needed
    const communityFunded = loan.shares
      .filter(s => !s.isSelfFunded)
      .reduce((sum, s) => sum + s.amount, 0);
    const remaining = loan.communityFundedAmount - communityFunded;

    if (remaining <= 0) {
      return NextResponse.json({ error: "This loan is already fully funded." }, { status: 400 });
    }

    const actualAmount = Math.min(amount, remaining);
    const shareCount = Math.ceil(actualAmount / SHARE_PRICE);

    // Check funder's watershed balance
    const funderWatershed = await prisma.watershed.findUnique({
      where: { userId: funderId },
    });

    if (!funderWatershed || funderWatershed.balance < actualAmount) {
      return NextResponse.json({ error: "Insufficient watershed balance." }, { status: 400 });
    }

    const newFunderBalance = funderWatershed.balance - actualAmount;
    const isFullyFunded = communityFunded + actualAmount >= loan.communityFundedAmount;

    await prisma.$transaction(async (tx) => {
      // Create funder's share
      await tx.watershedLoanShare.create({
        data: {
          loanId,
          funderId,
          count: shareCount,
          amount: actualAmount,
          isSelfFunded: false,
        },
      });

      // Deduct from funder's watershed
      await tx.watershed.update({
        where: { userId: funderId },
        data: {
          balance: newFunderBalance,
          totalOutflow: { increment: actualAmount },
        },
      });

      await tx.watershedTransaction.create({
        data: {
          watershedId: funderWatershed.id,
          type: "loan_funding",
          amount: -actualAmount,
          description: `Funded watershed-backed loan: $${actualAmount}`,
          balanceAfter: newFunderBalance,
        },
      });

      // If fully funded, activate the loan
      if (isFullyFunded) {
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        // Get borrower's watershed to credit the loan amount
        const borrowerWatershed = await tx.watershed.findUnique({
          where: { userId: loan.userId },
        });

        if (borrowerWatershed) {
          // Credit borrower with the full loan amount (disbursement)
          const newBorrowerBalance = borrowerWatershed.balance + loan.amount;
          await tx.watershed.update({
            where: { userId: loan.userId },
            data: {
              balance: newBorrowerBalance,
              totalInflow: { increment: loan.amount },
            },
          });

          await tx.watershedTransaction.create({
            data: {
              watershedId: borrowerWatershed.id,
              type: "loan_disbursement",
              amount: loan.amount,
              description: `Watershed-backed loan disbursed: $${loan.amount}`,
              balanceAfter: newBorrowerBalance,
            },
          });
        }

        await tx.watershedLoan.update({
          where: { id: loanId },
          data: {
            status: "active",
            disbursedAt: new Date(),
            nextPaymentDate,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      funded: actualAmount,
      shares: shareCount,
      isFullyFunded,
      message: isFullyFunded
        ? "Loan is now fully funded and active!"
        : `You contributed $${actualAmount.toFixed(2)} to this loan.`,
    });
  } catch (error) {
    logError("api/watershed-loans/[id]/fund", error, { userId: funderId });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
