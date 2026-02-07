import { prisma } from "@/lib/prisma";
import { DEFAULT_TIMELINE } from "@/lib/constants";

export type LoanHealthStatus =
  | "current"
  | "late"
  | "at_risk"
  | "defaulted"
  | "recovering"
  | "recovered";

/**
 * Calculate the health status of a loan based on payment history.
 */
export async function checkLoanStatus(loanId: string): Promise<{
  status: LoanHealthStatus;
  daysBehind: number;
  missedPayments: number;
}> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      repayments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  // If already in recovery, return that status
  if (loan.status === "recovering") {
    return {
      status: "recovering",
      daysBehind: 0,
      missedPayments: 0,
    };
  }

  // Calculate expected payments vs actual
  const loanStartDate = loan.createdAt;
  const now = new Date();
  const monthsActive = Math.floor(
    (now.getTime() - loanStartDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
  );

  const expectedPayments = Math.min(monthsActive, loan.repaymentMonths);
  const actualPayments = loan.repayments.length;
  const missedPayments = Math.max(0, expectedPayments - actualPayments);

  if (missedPayments === 0) {
    return { status: "current", daysBehind: 0, missedPayments: 0 };
  }

  // Calculate days behind based on last payment
  const lastPaymentDate =
    loan.repayments.length > 0 ? loan.repayments[0].createdAt : loanStartDate;

  const expectedNextPaymentDate = new Date(lastPaymentDate);
  expectedNextPaymentDate.setMonth(expectedNextPaymentDate.getMonth() + 1);

  const daysBehind = Math.floor(
    (now.getTime() - expectedNextPaymentDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysBehind <= 0) {
    return { status: "current", daysBehind: 0, missedPayments: 0 };
  }

  if (daysBehind <= DEFAULT_TIMELINE.lateDays) {
    return { status: "late", daysBehind, missedPayments };
  }

  if (daysBehind <= DEFAULT_TIMELINE.atRiskDays) {
    return { status: "at_risk", daysBehind, missedPayments };
  }

  return { status: "defaulted", daysBehind, missedPayments };
}

/**
 * Process status transitions for a loan.
 * Called periodically or after payment events.
 */
export async function processLoanStatusTransition(loanId: string) {
  const { status, daysBehind } = await checkLoanStatus(loanId);

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  // Skip if loan is completed or already in a terminal state
  if (loan.status === "completed" || loan.status === "expired") {
    return null;
  }

  // Handle transitions
  if (status === "defaulted" && loan.status !== "defaulted" && loan.status !== "recovering") {
    // Transition to defaulted
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "defaulted",
        defaultedAt: new Date(),
        latePayments: { increment: 1 },
      },
    });

    // Update user's credit tier (will be handled by tier calculation)
    return { transition: "to_defaulted", daysBehind };
  }

  return null;
}

/**
 * Start recovery process for a defaulted loan.
 * Called when borrower makes a payment on a defaulted loan.
 */
export async function startRecovery(loanId: string) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "defaulted") {
    throw new Error("Loan must be defaulted to start recovery");
  }

  return prisma.loan.update({
    where: { id: loanId },
    data: {
      status: "recovering",
      recoveryStartedAt: new Date(),
      recoveryPayments: 1, // This payment counts as the first
    },
  });
}

/**
 * Record a recovery payment and check if recovery is complete.
 * Returns true if recovery is complete.
 */
export async function recordRecoveryPayment(loanId: string): Promise<boolean> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "recovering") {
    return false;
  }

  const newRecoveryPayments = loan.recoveryPayments + 1;

  if (newRecoveryPayments >= DEFAULT_TIMELINE.recoveryPayments) {
    // Recovery complete
    await completeRecovery(loanId);
    return true;
  }

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      recoveryPayments: newRecoveryPayments,
    },
  });

  return false;
}

/**
 * Complete recovery and restore loan to active status.
 * Credit limit is halved as a consequence of defaulting.
 */
export async function completeRecovery(loanId: string) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { borrower: true },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  // Update loan status
  await prisma.loan.update({
    where: { id: loanId },
    data: {
      status: "repaying",
      recoveryStartedAt: null,
      recoveryPayments: 0,
    },
  });

  // Halve user's credit limit
  const newCreditLimit = Math.max(100, loan.borrower.creditLimit / 2);
  await prisma.user.update({
    where: { id: loan.borrowerId },
    data: {
      creditLimit: newCreditLimit,
    },
  });

  // Record tier change
  await prisma.loanTierHistory.create({
    data: {
      userId: loan.borrowerId,
      fromTier: loan.borrower.creditTier,
      toTier: loan.borrower.creditTier, // Tier stays same, just credit limit reduced
      reason: "Credit limit halved after default recovery",
    },
  });

  return { newCreditLimit };
}

/**
 * Reset recovery progress (called when a payment is missed during recovery).
 */
export async function resetRecoveryProgress(loanId: string) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan || loan.status !== "recovering") {
    return;
  }

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      recoveryPayments: 0,
      recoveryStartedAt: new Date(),
    },
  });
}

/**
 * Get list of at-risk and defaulted loans for admin dashboard.
 */
export async function getAtRiskLoans() {
  const loans = await prisma.loan.findMany({
    where: {
      status: { in: ["active", "repaying", "defaulted", "recovering"] },
    },
    include: {
      borrower: { select: { id: true, name: true, email: true, creditTier: true } },
      repayments: { orderBy: { createdAt: "desc" }, take: 3 },
      refinances: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const results = await Promise.all(
    loans.map(async (loan) => {
      const status = await checkLoanStatus(loan.id);
      return {
        ...loan,
        healthStatus: status.status,
        daysBehind: status.daysBehind,
        missedPayments: status.missedPayments,
      };
    })
  );

  // Filter to only at-risk or worse
  return results.filter(
    (r) => r.healthStatus === "late" || r.healthStatus === "at_risk" || r.healthStatus === "defaulted" || r.healthStatus === "recovering"
  );
}
