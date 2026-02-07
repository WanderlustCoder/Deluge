import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { refinanceSchema } from "@/lib/validation";
import {
  REFINANCE_MIN_BALANCE,
  REFINANCE_FEE_PERCENT,
  REFINANCE_MIN_FEE,
} from "@/lib/constants";

// GET: calculate refinance options
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      repayments: true,
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (loan.borrowerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the borrower can view refinance options" },
      { status: 403 }
    );
  }

  // Calculate remaining balance
  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0);
  const remainingBalance = loan.amount - totalRepaid;

  // Check eligibility
  const isEligible =
    (loan.status === "active" || loan.status === "repaying" || loan.status === "defaulted") &&
    remainingBalance >= REFINANCE_MIN_BALANCE;

  if (!isEligible) {
    return NextResponse.json({
      eligible: false,
      reason:
        remainingBalance < REFINANCE_MIN_BALANCE
          ? `Minimum balance of $${REFINANCE_MIN_BALANCE} required for refinancing`
          : "Loan status does not allow refinancing",
      remainingBalance,
    });
  }

  // Calculate fee
  const calculatedFee = remainingBalance * REFINANCE_FEE_PERCENT;
  const fee = Math.max(calculatedFee, REFINANCE_MIN_FEE);

  // Calculate options for various new terms
  const currentTerm = loan.repaymentMonths;
  const options = [6, 9, 12, 18, 24]
    .filter((term) => term > currentTerm)
    .map((newTerm) => ({
      newTerm,
      newMonthlyPayment: remainingBalance / newTerm,
      fee,
      savings: loan.monthlyPayment - remainingBalance / newTerm,
    }));

  return NextResponse.json({
    eligible: true,
    remainingBalance,
    currentTerm,
    currentMonthlyPayment: loan.monthlyPayment,
    fee,
    options,
  });
}

// POST: execute refinance
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = refinanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        repayments: true,
        borrower: {
          include: { watershed: true },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.borrowerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the borrower can refinance" },
        { status: 403 }
      );
    }

    // Calculate remaining balance
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0);
    const remainingBalance = loan.amount - totalRepaid;

    // Check eligibility
    if (
      !(loan.status === "active" || loan.status === "repaying" || loan.status === "defaulted")
    ) {
      return NextResponse.json(
        { error: "Loan status does not allow refinancing" },
        { status: 400 }
      );
    }

    if (remainingBalance < REFINANCE_MIN_BALANCE) {
      return NextResponse.json(
        { error: `Minimum balance of $${REFINANCE_MIN_BALANCE} required` },
        { status: 400 }
      );
    }

    const { newTerm, reason } = parsed.data;

    if (newTerm <= loan.repaymentMonths) {
      return NextResponse.json(
        { error: "New term must be longer than current term" },
        { status: 400 }
      );
    }

    // Calculate fee
    const calculatedFee = remainingBalance * REFINANCE_FEE_PERCENT;
    const fee = Math.max(calculatedFee, REFINANCE_MIN_FEE);
    const newMonthlyPayment = remainingBalance / newTerm;

    // Check if user can afford the fee
    const watershed = loan.borrower.watershed;
    if (!watershed || watershed.balance < fee) {
      return NextResponse.json(
        { error: `Insufficient watershed balance to cover $${fee.toFixed(2)} refinance fee` },
        { status: 400 }
      );
    }

    // Execute refinance in a transaction
    await prisma.$transaction([
      // Create refinance record
      prisma.loanRefinance.create({
        data: {
          loanId: id,
          previousPayment: loan.monthlyPayment,
          newPayment: newMonthlyPayment,
          previousTerm: loan.repaymentMonths,
          newTerm,
          fee,
          reason: reason || null,
        },
      }),
      // Update loan terms
      prisma.loan.update({
        where: { id },
        data: {
          repaymentMonths: newTerm,
          monthlyPayment: newMonthlyPayment,
          status: loan.status === "defaulted" ? "repaying" : loan.status,
        },
      }),
      // Deduct fee from watershed
      prisma.watershed.update({
        where: { userId: session.user.id },
        data: {
          balance: { decrement: fee },
          totalOutflow: { increment: fee },
        },
      }),
      // Record transaction
      prisma.watershedTransaction.create({
        data: {
          watershedId: watershed.id,
          type: "refinance_fee",
          amount: -fee,
          description: `Refinance fee for loan: ${loan.purpose}`,
          balanceAfter: watershed.balance - fee,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        previousTerm: loan.repaymentMonths,
        newTerm,
        previousPayment: loan.monthlyPayment,
        newPayment: newMonthlyPayment,
        fee,
      },
    });
  } catch (error) {
    logError("api/loans/refinance", error, {
      userId: session.user.id,
      route: `POST /api/loans/${id}/refinance`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
