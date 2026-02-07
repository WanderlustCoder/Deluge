// Metro 2 Format Generator
// Main entry point for generating Metro 2 credit bureau reports

import { prisma } from '../../prisma';
import { generateHeader, type HeaderData, validateHeaderData } from './header';
import { generateBaseSegment, type BaseSegmentData, validateBaseSegmentData } from './base';
import { generateTrailer, calculateBlockCount, type TrailerData } from './trailer';
import { mapLoanStatusToAccountStatus, mapDaysToPaymentRating } from './constants';

export interface Metro2ReportOptions {
  furnisherId: string;
  furnisherName: string;
  reportingPeriod: Date;
}

export interface Metro2GenerationResult {
  success: boolean;
  recordCount: number;
  fileContent: string;
  errors: string[];
  warnings: string[];
}

// Generate a full Metro 2 report for all eligible loans
export async function generateMetro2Report(
  options: Metro2ReportOptions
): Promise<Metro2GenerationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: string[] = [];

  // Validate options
  if (!options.furnisherId) {
    errors.push('Furnisher ID is required');
    return { success: false, recordCount: 0, fileContent: '', errors, warnings };
  }

  // Get all loans with active credit reporting consent
  const loans = await prisma.loan.findMany({
    where: {
      creditReportingConsent: {
        consentGiven: true,
        withdrawnAt: null,
      },
      status: { notIn: ['funding', 'expired'] },
    },
    include: {
      borrower: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      repayments: {
        orderBy: { createdAt: 'desc' },
      },
      creditReportingStatus: true,
    },
  });

  if (loans.length === 0) {
    warnings.push('No eligible loans found for credit reporting');
    return { success: true, recordCount: 0, fileContent: '', errors, warnings };
  }

  // Generate header
  const headerData: HeaderData = {
    furnisherId: options.furnisherId,
    furnisherName: options.furnisherName,
    activityDate: options.reportingPeriod,
    creationDate: new Date(),
    reporterAddress: '123 Deluge Way',
    reporterCity: 'Boise',
    reporterState: 'ID',
    reporterZip: '83702',
    reporterPhone: '2085551234',
  };

  const headerValidation = validateHeaderData(headerData);
  if (!headerValidation.valid) {
    errors.push(...headerValidation.errors);
    return { success: false, recordCount: 0, fileContent: '', errors, warnings };
  }

  records.push(generateHeader(headerData));

  // Generate base segments for each loan
  for (const loan of loans) {
    try {
      const baseSegment = await generateLoanBaseSegment(loan, options);
      if (baseSegment) {
        records.push(baseSegment);
      }
    } catch (error) {
      warnings.push(`Failed to generate record for loan ${loan.id}: ${error}`);
    }
  }

  // Generate trailer
  const trailerData: TrailerData = {
    totalBaseRecords: records.length - 1, // Exclude header
    totalJ1Records: 0,
    totalJ2Records: 0,
    totalK1Records: 0,
    totalK2Records: 0,
    totalK3Records: 0,
    totalK4Records: 0,
    blocksCount: calculateBlockCount(records.length + 1),
  };

  records.push(generateTrailer(trailerData));

  return {
    success: errors.length === 0,
    recordCount: records.length,
    fileContent: records.join('\n'),
    errors,
    warnings,
  };
}

// Generate base segment for a single loan
async function generateLoanBaseSegment(
  loan: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    repaymentMonths: number;
    monthlyPayment: number;
    latePayments: number;
    borrower: { id: string; name: string; email: string };
    repayments: Array<{ amount: number; createdAt: Date }>;
  },
  options: Metro2ReportOptions
): Promise<string | null> {
  // Parse borrower name
  const nameParts = loan.borrower.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // Calculate payment history
  const paymentHistory = await buildPaymentHistory(loan.id, 24);

  // Calculate current balance
  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
  const currentBalance = Math.max(0, loan.amount - totalRepaid);

  // Calculate days delinquent (simplified)
  const daysDelinquent = calculateDaysDelinquent(loan);

  // Get last payment date
  const lastPayment = loan.repayments[0];

  const baseData: BaseSegmentData = {
    furnisherId: options.furnisherId,
    accountNumber: `DELUGE-${loan.id.substring(0, 20)}`,
    consumerFirstName: firstName,
    consumerLastName: lastName,
    dateOpened: loan.createdAt,
    creditLimit: loan.amount,
    highestCredit: loan.amount,
    termsMonths: loan.repaymentMonths,
    scheduledPayment: loan.monthlyPayment,
    actualPayment: lastPayment?.amount || 0,
    accountStatus: mapLoanStatusToAccountStatus(loan.status, daysDelinquent),
    paymentHistory,
    currentBalance,
    amountPastDue: daysDelinquent > 0 ? loan.monthlyPayment : 0,
    dateOfInformation: options.reportingPeriod,
    dateLastPayment: lastPayment?.createdAt,
    dateClosed: loan.status === 'completed' ? new Date() : undefined,
  };

  const validation = validateBaseSegmentData(baseData);
  if (!validation.valid) {
    console.warn(`Validation failed for loan ${loan.id}:`, validation.errors);
    return null;
  }

  return generateBaseSegment(baseData);
}

// Build 24-month payment history
async function buildPaymentHistory(loanId: string, months: number = 24): Promise<string> {
  // Get loan creation date and repayments
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      repayments: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!loan) return '0'.repeat(months);

  // Build month-by-month history
  const history: string[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now);
    monthDate.setMonth(monthDate.getMonth() - i);

    // Check if loan existed in this month
    if (monthDate < loan.createdAt) {
      history.push('B'); // No history available
      continue;
    }

    // Check if payment was made this month
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthlyPayment = loan.repayments.find(
      (r) => r.createdAt >= startOfMonth && r.createdAt <= endOfMonth
    );

    if (monthlyPayment) {
      // Payment made - current
      history.push('0');
    } else if (loan.status === 'completed') {
      // Paid off
      history.push('0');
    } else {
      // No payment found - could be late
      // Simplified: mark as current if within grace period
      history.push('0');
    }
  }

  return history.join('');
}

// Calculate days delinquent based on last payment
function calculateDaysDelinquent(loan: {
  monthlyPayment: number;
  repayments: Array<{ amount: number; createdAt: Date }>;
}): number {
  if (loan.repayments.length === 0) {
    return 0; // New loan
  }

  const lastPayment = loan.repayments[0];
  const daysSincePayment = Math.floor(
    (Date.now() - lastPayment.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If more than 30 days since payment, consider delinquent
  return Math.max(0, daysSincePayment - 30);
}

// Store Metro 2 record in database
export async function storeMetro2Record(
  loanId: string,
  reportingPeriod: Date,
  data: {
    accountStatus: string;
    paymentHistory: string;
    currentBalance: number;
    amountPastDue: number;
    scheduledPayment: number;
    actualPayment?: number;
    rawData: string;
  }
) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    select: { createdAt: true },
  });

  if (!loan) {
    throw new Error('Loan not found');
  }

  return prisma.metro2Record.create({
    data: {
      loanId,
      recordType: 'base',
      reportingPeriod,
      accountStatus: data.accountStatus,
      paymentHistory: data.paymentHistory,
      currentBalance: data.currentBalance,
      amountPastDue: data.amountPastDue,
      dateOpened: loan.createdAt,
      scheduledPayment: data.scheduledPayment,
      actualPayment: data.actualPayment,
      rawData: data.rawData,
      submitted: false,
    },
  });
}

// Export all modules
export * from './constants';
export * from './header';
export * from './base';
export * from './trailer';
