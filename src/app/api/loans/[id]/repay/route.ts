import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SERVICING_FEE_RATE } from "@/lib/constants";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { shares: true, repayments: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    if (loan.borrowerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the borrower can make repayments." },
        { status: 403 }
      );
    }

    if (loan.status !== "active" && loan.status !== "repaying") {
      return NextResponse.json(
        { error: "Loan is not in a repayable state." },
        { status: 400 }
      );
    }

    // Calculate remaining principal
    const totalRepaid = loan.repayments.reduce(
      (sum, r) => sum + r.principalPaid,
      0
    );
    const remainingPrincipal = loan.amount - totalRepaid;

    if (remainingPrincipal <= 0) {
      return NextResponse.json(
        { error: "Loan is already fully repaid." },
        { status: 400 }
      );
    }

    const scheduledPayment = Math.min(loan.monthlyPayment, remainingPrincipal * (1 + SERVICING_FEE_RATE));
    const servicingFee = scheduledPayment * SERVICING_FEE_RATE;
    const principalPaid = scheduledPayment - servicingFee;
    const actualPrincipal = Math.min(principalPaid, remainingPrincipal);

    const isCompleted = actualPrincipal >= remainingPrincipal - 0.001;

    // Check borrower's watershed
    const borrowerWatershed = await prisma.watershed.findUnique({
      where: { userId: session.user.id },
    });

    if (!borrowerWatershed || borrowerWatershed.balance < scheduledPayment) {
      return NextResponse.json(
        { error: "Insufficient watershed balance for repayment." },
        { status: 400 }
      );
    }

    const borrowerNewBalance = borrowerWatershed.balance - scheduledPayment;

    // Distribute principal to funders proportionally
    const totalShares = loan.shares.reduce((sum, s) => sum + s.count, 0);
    const funderUpdates = [];

    for (const share of loan.shares) {
      const proportion = share.count / totalShares;
      const funderCredit = actualPrincipal * proportion;

      const funderWatershed = await prisma.watershed.findUnique({
        where: { userId: share.funderId },
      });

      if (funderWatershed) {
        const funderNewBalance = funderWatershed.balance + funderCredit;
        funderUpdates.push(
          prisma.watershed.update({
            where: { userId: share.funderId },
            data: {
              balance: funderNewBalance,
              totalInflow: { increment: funderCredit },
            },
          }),
          prisma.watershedTransaction.create({
            data: {
              watershedId: funderWatershed.id,
              type: "loan_repayment",
              amount: funderCredit,
              description: `Loan repayment: ${loan.purpose}`,
              balanceAfter: funderNewBalance,
            },
          }),
          prisma.loanShare.update({
            where: { id: share.id },
            data: { repaid: { increment: funderCredit } },
          })
        );
      }
    }

    await prisma.$transaction([
      prisma.loanRepayment.create({
        data: {
          loanId: id,
          amount: scheduledPayment,
          principalPaid: actualPrincipal,
          servicingFee,
        },
      }),
      prisma.watershed.update({
        where: { userId: session.user.id },
        data: {
          balance: borrowerNewBalance,
          totalOutflow: { increment: scheduledPayment },
        },
      }),
      prisma.watershedTransaction.create({
        data: {
          watershedId: borrowerWatershed.id,
          type: "loan_repayment_out",
          amount: -scheduledPayment,
          description: `Loan repayment: ${loan.purpose}`,
          balanceAfter: borrowerNewBalance,
        },
      }),
      prisma.loan.update({
        where: { id },
        data: {
          status: isCompleted ? "completed" : "repaying",
        },
      }),
      ...funderUpdates,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        paymentAmount: scheduledPayment,
        principalPaid: actualPrincipal,
        servicingFee,
        isCompleted,
        borrowerNewBalance,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
