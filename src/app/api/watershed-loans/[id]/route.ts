import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { getLendingPortfolioSummary } from "@/lib/watershed-loans";

// GET: Get watershed loan details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const loan = await prisma.watershedLoan.findUnique({
      where: { id },
      include: {
        shares: {
          include: {
            funder: { select: { id: true, name: true } },
          },
        },
        payments: { orderBy: { paidAt: "desc" } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    // Anyone can see a loan in funding status (for community funding)
    // Only the borrower or funders can see other details
    const isBorrower = loan.userId === session.user.id;
    const isFunder = loan.shares.some(s => s.funderId === session.user.id && !s.isSelfFunded);
    const isAdmin = session.user.accountType === "admin";

    if (!isBorrower && !isFunder && !isAdmin && loan.status !== "funding") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Get portfolio summary for trust signal (for funders viewing backed loans)
    let portfolioSummary = null;
    if (loan.type === "backed" && (loan.status === "funding" || isFunder || isAdmin)) {
      portfolioSummary = await getLendingPortfolioSummary(loan.userId);
    }

    // Calculate repayment progress
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    const communityPaid = loan.payments.reduce((sum, p) => sum + p.appliedToCommunity, 0);
    const selfPaid = loan.payments.reduce((sum, p) => sum + p.appliedToSelf, 0);
    const scheduledPayments = loan.payments.filter(p => p.type === "scheduled");
    const accelerations = loan.payments.filter(p => p.type === "acceleration");

    // Community funding progress
    const communityFunded = loan.shares
      .filter(s => !s.isSelfFunded)
      .reduce((sum, s) => sum + s.amount, 0);

    // Funder-specific info
    let funderInfo = null;
    if (isFunder) {
      const funderShare = loan.shares.find(
        s => s.funderId === session.user.id && !s.isSelfFunded
      );
      if (funderShare) {
        funderInfo = {
          contributed: funderShare.amount,
          sharesOwned: funderShare.count,
          repaidToYou: funderShare.repaid,
        };
      }
    }

    // Get borrower's current watershed balance for accelerate option
    let watershedBalance = 0;
    if (isBorrower && loan.fundingLockActive) {
      const watershed = await prisma.watershed.findUnique({
        where: { userId: session.user.id },
      });
      watershedBalance = watershed?.balance || 0;
    }

    return NextResponse.json({
      loan: {
        id: loan.id,
        type: loan.type,
        amount: loan.amount,
        selfFundedAmount: loan.selfFundedAmount,
        communityFundedAmount: loan.communityFundedAmount,
        remainingBalance: loan.remainingBalance,
        communityRemainingBalance: loan.communityRemainingBalance,
        purpose: loan.purpose,
        status: loan.status,
        originationFee: loan.originationFee,
        monthlyPayment: loan.monthlyPayment,
        termMonths: loan.termMonths,
        paymentsRemaining: loan.paymentsRemaining,
        nextPaymentDate: loan.nextPaymentDate,
        fundingDeadline: loan.fundingDeadline,
        fundingLockActive: loan.fundingLockActive,
        communityRepaidAt: loan.communityRepaidAt,
        disbursedAt: loan.disbursedAt,
        completedAt: loan.completedAt,
        createdAt: loan.createdAt,
        borrower: loan.user,
      },
      progress: {
        totalPaid,
        communityPaid,
        selfPaid,
        scheduledPaymentsTotal: scheduledPayments.reduce((s, p) => s + p.amount, 0),
        accelerationsTotal: accelerations.reduce((s, p) => s + p.amount, 0),
        communityFunded,
        communityFundingProgress: loan.communityFundedAmount > 0
          ? communityFunded / loan.communityFundedAmount
          : 1,
        communityRepaymentProgress: loan.communityFundedAmount > 0
          ? communityPaid / loan.communityFundedAmount
          : 1,
      },
      portfolioSummary,
      funderInfo,
      watershedBalance: isBorrower ? watershedBalance : undefined,
      payments: loan.payments.map(p => ({
        id: p.id,
        amount: p.amount,
        type: p.type,
        appliedToCommunity: p.appliedToCommunity,
        appliedToSelf: p.appliedToSelf,
        paidAt: p.paidAt,
      })),
    });
  } catch (error) {
    logError("api/watershed-loans/[id]", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
