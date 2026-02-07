import { prisma } from '../prisma';

// FCRA compliance checks and utilities

export interface ComplianceCheck {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

// Verify loan is eligible for credit reporting
export async function checkLoanEligibility(loanId: string): Promise<ComplianceCheck> {
  const issues: string[] = [];
  const warnings: string[] = [];

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      borrower: {
        select: { id: true, name: true, email: true },
      },
      creditReportingConsent: true,
      repayments: true,
    },
  });

  if (!loan) {
    issues.push('Loan not found');
    return { passed: false, issues, warnings };
  }

  // Check consent
  if (!loan.creditReportingConsent) {
    issues.push('No credit reporting consent on file');
  } else if (loan.creditReportingConsent.withdrawnAt) {
    issues.push('Credit reporting consent has been withdrawn');
  }

  // Check loan status - can only report on active or completed loans
  if (loan.status === 'funding' || loan.status === 'expired') {
    issues.push(`Cannot report loans in ${loan.status} status`);
  }

  // Check borrower has required information
  if (!loan.borrower.name) {
    issues.push('Borrower name is required for credit reporting');
  }

  if (!loan.borrower.email) {
    issues.push('Borrower email is required for credit reporting');
  }

  // Warnings (non-blocking)
  if (loan.status === 'defaulted') {
    warnings.push('Loan is in default status - negative reporting will be submitted');
  }

  if (loan.latePayments > 0) {
    warnings.push(`Loan has ${loan.latePayments} late payment(s) on record`);
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  };
}

// Dispute timeline compliance check
export async function checkDisputeCompliance(disputeId: string): Promise<ComplianceCheck> {
  const issues: string[] = [];
  const warnings: string[] = [];

  const dispute = await prisma.creditDispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    issues.push('Dispute not found');
    return { passed: false, issues, warnings };
  }

  const now = new Date();
  const daysRemaining = Math.ceil(
    (dispute.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // FCRA requires 30-day resolution
  if (daysRemaining < 0) {
    issues.push('Dispute resolution deadline has passed - FCRA violation risk');
  } else if (daysRemaining <= 5) {
    warnings.push(`Only ${daysRemaining} days remaining to resolve dispute`);
  } else if (daysRemaining <= 10) {
    warnings.push(`${daysRemaining} days remaining - prioritize resolution`);
  }

  // Check if resolved disputes have been reported to bureaus
  if (dispute.status === 'resolved' && !dispute.bureauNotified) {
    issues.push('Dispute resolved but bureaus have not been notified');
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  };
}

// Calculate 30-day dispute deadline
export function calculateDisputeDeadline(createdAt: Date): Date {
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + 30);
  return deadline;
}

// Get all disputes approaching deadline
export async function getDisputesApproachingDeadline(daysThreshold: number = 5) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  return prisma.creditDispute.findMany({
    where: {
      status: { in: ['open', 'investigating'] },
      dueDate: { lte: thresholdDate },
    },
    include: {
      loan: {
        select: { id: true, amount: true, borrowerId: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
}

// Get overdue disputes (FCRA violation risk)
export async function getOverdueDisputes() {
  return prisma.creditDispute.findMany({
    where: {
      status: { in: ['open', 'investigating'] },
      dueDate: { lt: new Date() },
    },
    include: {
      loan: {
        select: { id: true, amount: true, borrowerId: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
}

// Validate accuracy of data being reported
export function validateReportingData(data: {
  accountStatus: string;
  currentBalance: number;
  paymentHistory: string;
}): ComplianceCheck {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Validate account status code
  const validStatusCodes = ['11', '13', '71', '78', '80', '82', '83', '84', '93', '94', '95', '96', '97'];
  if (!validStatusCodes.includes(data.accountStatus)) {
    issues.push(`Invalid account status code: ${data.accountStatus}`);
  }

  // Validate balance is non-negative
  if (data.currentBalance < 0) {
    issues.push('Current balance cannot be negative');
  }

  // Validate payment history format (24 characters, valid codes)
  if (data.paymentHistory.length !== 24) {
    issues.push(`Payment history must be 24 characters, got ${data.paymentHistory.length}`);
  }

  const validPaymentCodes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'B', 'D', 'E', 'G', 'H', 'J', 'K', 'L'];
  for (const char of data.paymentHistory) {
    if (!validPaymentCodes.includes(char)) {
      issues.push(`Invalid payment history code: ${char}`);
      break;
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  };
}
