import { prisma } from "@/lib/prisma";
import {
  SHARE_PRICE,
  WATERSHED_LOAN_MIN_BALANCE,
  WATERSHED_LOAN_MIN_AMOUNT,
  WATERSHED_LOAN_ORIGINATION_FEE_RATE,
  WATERSHED_LOAN_TERM_LIMITS,
  WATERSHED_LOAN_FUNDING_DEADLINE_DAYS,
} from "@/lib/constants";

// --- Available Balance Calculation ---

export async function getAvailableWatershedBalance(userId: string): Promise<{
  totalBalance: number;
  earmarked: number;
  activeWatershedLoanDeduction: number;
  available: number;
}> {
  const watershed = await prisma.watershed.findUnique({
    where: { userId },
  });

  if (!watershed) {
    return { totalBalance: 0, earmarked: 0, activeWatershedLoanDeduction: 0, available: 0 };
  }

  // Earmarked: pledged allocations not yet disbursed
  const earmarkedResult = await prisma.allocation.aggregate({
    where: { userId, status: "pledged" },
    _sum: { amount: true },
  });
  const earmarked = earmarkedResult._sum.amount || 0;

  // Active watershed loan self-funded amount still outstanding
  const activeWatershedLoan = await prisma.watershedLoan.findFirst({
    where: {
      userId,
      status: { in: ["pending", "funding", "active", "late", "at_risk", "recovering"] },
    },
  });
  const activeWatershedLoanDeduction = activeWatershedLoan?.selfFundedAmount || 0;

  const available = Math.max(0, watershed.balance - earmarked - activeWatershedLoanDeduction);

  return {
    totalBalance: watershed.balance,
    earmarked,
    activeWatershedLoanDeduction,
    available,
  };
}

// --- Eligibility Check ---

export async function checkWatershedLoanEligibility(userId: string): Promise<{
  eligible: boolean;
  reason?: string;
  availableBalance: number;
  portfolioValue: number;
}> {
  const balanceInfo = await getAvailableWatershedBalance(userId);

  // Must have at least $100 available
  if (balanceInfo.available < WATERSHED_LOAN_MIN_BALANCE) {
    return {
      eligible: false,
      reason: `You need at least $${WATERSHED_LOAN_MIN_BALANCE} available in your watershed to apply.`,
      availableBalance: balanceInfo.available,
      portfolioValue: 0,
    };
  }

  // Check for existing active watershed loan
  const existingLoan = await prisma.watershedLoan.findFirst({
    where: {
      userId,
      status: { in: ["pending", "funding", "active", "late", "at_risk", "recovering"] },
    },
  });

  if (existingLoan) {
    return {
      eligible: false,
      reason: "You already have an active watershed loan.",
      availableBalance: balanceInfo.available,
      portfolioValue: 0,
    };
  }

  // Get lending portfolio value
  const portfolioValue = await getLendingPortfolioValue(userId);

  return {
    eligible: true,
    availableBalance: balanceInfo.available,
    portfolioValue,
  };
}

// --- Lending Portfolio ---

export async function getLendingPortfolioValue(userId: string): Promise<number> {
  const activeShares = await prisma.loanShare.findMany({
    where: {
      funderId: userId,
      loan: { status: { in: ["active", "repaying", "funding"] } },
    },
  });

  return activeShares.reduce((sum, s) => sum + (s.amount - s.repaid), 0);
}

export async function getLendingPortfolioSummary(userId: string) {
  const shares = await prisma.loanShare.findMany({
    where: { funderId: userId },
    include: { loan: { select: { status: true, amount: true } } },
  });

  const activeLoans = shares.filter(s =>
    ["active", "repaying", "funding"].includes(s.loan.status)
  );
  const completedLoans = shares.filter(s => s.loan.status === "completed");
  const defaultedLoans = shares.filter(s => s.loan.status === "defaulted");

  return {
    totalFunded: shares.length,
    activeLoanCount: activeLoans.length,
    activeValue: activeLoans.reduce((sum, s) => sum + (s.amount - s.repaid), 0),
    completedCount: completedLoans.length,
    defaultedCount: defaultedLoans.length,
    totalRepaidToUser: shares.reduce((sum, s) => sum + s.repaid, 0),
  };
}

// --- Term Calculation ---

export function getMaxTermMonths(amount: number): number {
  for (const tier of WATERSHED_LOAN_TERM_LIMITS) {
    if (amount >= tier.minAmount && amount <= tier.maxAmount) {
      return tier.maxMonths;
    }
  }
  return 24;
}

export function getFundingDeadlineDays(communityAmount: number): number {
  for (const tier of WATERSHED_LOAN_FUNDING_DEADLINE_DAYS) {
    if (communityAmount <= tier.maxAmount) {
      return tier.days;
    }
  }
  return 45;
}

// --- Origination Fee ---

export function calculateOriginationFee(communityFundedAmount: number): number {
  if (communityFundedAmount <= 0) return 0;
  return Math.round(communityFundedAmount * WATERSHED_LOAN_ORIGINATION_FEE_RATE * 100) / 100;
}

// --- Loan Type Determination ---

export function determineLoanType(
  requestedAmount: number,
  availableBalance: number
): { type: "pure" | "backed"; selfFunded: number; communityFunded: number } {
  if (requestedAmount <= availableBalance) {
    return { type: "pure", selfFunded: requestedAmount, communityFunded: 0 };
  }
  return {
    type: "backed",
    selfFunded: availableBalance,
    communityFunded: requestedAmount - availableBalance,
  };
}

// --- Monthly Payment Calculation ---

export function calculateMonthlyPayment(totalObligation: number, termMonths: number): number {
  return Math.round((totalObligation / termMonths) * 100) / 100;
}

// --- Funding Lock Check ---

export async function hasFundingLock(userId: string): Promise<boolean> {
  const activeLoan = await prisma.watershedLoan.findFirst({
    where: {
      userId,
      fundingLockActive: true,
      status: { in: ["active", "late", "at_risk", "defaulted", "recovering"] },
    },
  });
  return !!activeLoan;
}

// --- Share Distribution for Repayments ---

export function distributePaymentToShares(
  payment: number,
  shares: Array<{ id: string; amount: number; repaid: number; isSelfFunded: boolean }>
): {
  distributions: Array<{ shareId: string; amount: number }>;
  appliedToCommunity: number;
  appliedToSelf: number;
} {
  const totalOutstanding = shares.reduce((sum, s) => sum + (s.amount - s.repaid), 0);
  if (totalOutstanding <= 0) return { distributions: [], appliedToCommunity: 0, appliedToSelf: 0 };

  let appliedToCommunity = 0;
  let appliedToSelf = 0;
  const distributions: Array<{ shareId: string; amount: number }> = [];

  for (const share of shares) {
    const outstanding = share.amount - share.repaid;
    if (outstanding <= 0) continue;

    const proportion = outstanding / totalOutstanding;
    const credit = Math.round(payment * proportion * 100) / 100;
    const actual = Math.min(credit, outstanding);

    distributions.push({ shareId: share.id, amount: actual });

    if (share.isSelfFunded) {
      appliedToSelf += actual;
    } else {
      appliedToCommunity += actual;
    }
  }

  return { distributions, appliedToCommunity, appliedToSelf };
}

// --- Validation ---

export function validateWatershedLoanApplication(params: {
  amount: number;
  termMonths: number;
  availableBalance: number;
  purpose: string;
}): { valid: boolean; error?: string } {
  const { amount, termMonths, availableBalance, purpose } = params;

  if (amount < WATERSHED_LOAN_MIN_AMOUNT) {
    return { valid: false, error: `Minimum loan amount is $${WATERSHED_LOAN_MIN_AMOUNT}.` };
  }

  if (!purpose || purpose.trim().length < 10) {
    return { valid: false, error: "Please provide a purpose description (at least 10 characters)." };
  }

  const maxTerm = getMaxTermMonths(amount);
  if (termMonths < 1 || termMonths > maxTerm) {
    return { valid: false, error: `Repayment term must be between 1 and ${maxTerm} months.` };
  }

  if (availableBalance < WATERSHED_LOAN_MIN_BALANCE) {
    return { valid: false, error: `You need at least $${WATERSHED_LOAN_MIN_BALANCE} in available watershed balance.` };
  }

  return { valid: true };
}

export { SHARE_PRICE, WATERSHED_LOAN_MIN_AMOUNT, WATERSHED_LOAN_MIN_BALANCE };
