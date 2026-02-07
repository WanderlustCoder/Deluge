import { prisma } from '../prisma';

// Current consent form version
export const CURRENT_CONSENT_VERSION = '1.0';

// Record credit reporting consent
export async function recordCreditConsent(
  userId: string,
  loanId: string,
  options?: {
    ipAddress?: string;
    userAgent?: string;
  }
) {
  // Verify loan belongs to user
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    select: { borrowerId: true },
  });

  if (!loan || loan.borrowerId !== userId) {
    throw new Error('Loan not found or unauthorized');
  }

  // Check if consent already exists
  const existing = await prisma.creditReportingConsent.findUnique({
    where: { loanId },
  });

  if (existing) {
    throw new Error('Consent already recorded for this loan');
  }

  // Create consent record
  const consent = await prisma.creditReportingConsent.create({
    data: {
      userId,
      loanId,
      consentGiven: true,
      consentDate: new Date(),
      consentVersion: CURRENT_CONSENT_VERSION,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    },
  });

  // Initialize credit reporting status
  await prisma.creditReportingStatus.create({
    data: {
      loanId,
      isReporting: true,
      bureaus: 'experian,transunion,equifax',
      status: 'pending',
    },
  });

  return consent;
}

// Withdraw credit reporting consent
export async function withdrawConsent(
  userId: string,
  loanId: string,
  reason?: string
) {
  const consent = await prisma.creditReportingConsent.findUnique({
    where: { loanId },
  });

  if (!consent || consent.userId !== userId) {
    throw new Error('Consent not found or unauthorized');
  }

  if (consent.withdrawnAt) {
    throw new Error('Consent already withdrawn');
  }

  // Update consent record
  await prisma.creditReportingConsent.update({
    where: { loanId },
    data: {
      withdrawnAt: new Date(),
      withdrawnReason: reason,
    },
  });

  // Update reporting status
  await prisma.creditReportingStatus.update({
    where: { loanId },
    data: {
      isReporting: false,
      status: 'completed',
    },
  });

  return true;
}

// Get consent status for a loan
export async function getConsentStatus(loanId: string) {
  const consent = await prisma.creditReportingConsent.findUnique({
    where: { loanId },
  });

  if (!consent) {
    return {
      hasConsent: false,
      isActive: false,
      consentDate: null,
      withdrawnAt: null,
    };
  }

  return {
    hasConsent: true,
    isActive: consent.consentGiven && !consent.withdrawnAt,
    consentDate: consent.consentDate,
    withdrawnAt: consent.withdrawnAt,
    consentVersion: consent.consentVersion,
  };
}

// Get all loans with active credit reporting for a user
export async function getUserCreditReportingLoans(userId: string) {
  return prisma.loan.findMany({
    where: {
      borrowerId: userId,
      creditReportingConsent: {
        consentGiven: true,
        withdrawnAt: null,
      },
    },
    include: {
      creditReportingStatus: true,
      creditReportingConsent: true,
    },
  });
}

// Check if consent is valid for reporting
export async function isConsentValidForReporting(loanId: string): Promise<boolean> {
  const consent = await prisma.creditReportingConsent.findUnique({
    where: { loanId },
  });

  return !!(consent && consent.consentGiven && !consent.withdrawnAt);
}
