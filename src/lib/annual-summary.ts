import { prisma } from './prisma';

interface AnnualGivingData {
  totalCashContributed: number;
  totalAdFunded: number;
  totalReferralCredits: number;
  totalMatchingReceived: number;
  totalAllocated: number;
  projectsFunded: number;
  loansFunded: number;
  loansRepaid: number;
  communitiesSupported: number;
  deductibleAmount: number;
  nonDeductibleAmount: number;
}

// Calculate annual giving totals for a user
export async function calculateAnnualGiving(
  userId: string,
  year: number
): Promise<AnnualGivingData> {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  // Get cash contributions
  const contributions = await prisma.contribution.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const totalCashContributed = contributions
    .filter((c) => c.type === 'cash')
    .reduce((sum, c) => sum + c.amount, 0);

  // Get ad views (watershed credits from ads)
  const adViews = await prisma.adView.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const totalAdFunded = adViews.reduce((sum, a) => sum + a.watershedCredit, 0);

  // Get referral credits
  const referralsAsReferrer = await prisma.referral.findMany({
    where: {
      referrerId: userId,
      activatedAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const totalReferralCredits = referralsAsReferrer.reduce(
    (sum, r) => sum + r.signupCredit + r.actionCredit + r.retentionCredit,
    0
  );

  // Get matching contributions received
  const matchingContributions = await prisma.matchingContribution.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const totalMatchingReceived = matchingContributions.reduce(
    (sum, m) => sum + m.matchAmount,
    0
  );

  // Get project allocations with tax status
  const allocations = await prisma.allocation.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          taxDeductible: true,
        },
      },
    },
  });

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

  // Count unique projects funded
  const uniqueProjectIds = new Set(allocations.map((a) => a.projectId));
  const projectsFunded = uniqueProjectIds.size;

  // Calculate deductible vs non-deductible
  let deductibleAmount = 0;
  let nonDeductibleAmount = 0;

  for (const allocation of allocations) {
    if (allocation.project.taxDeductible) {
      deductibleAmount += allocation.amount;
    } else {
      nonDeductibleAmount += allocation.amount;
    }
  }

  // Get loan shares funded
  const loanShares = await prisma.loanShare.findMany({
    where: {
      funderId: userId,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const loansFunded = new Set(loanShares.map((s) => s.loanId)).size;

  // Get loan repayments received
  const loanSharesWithRepayments = await prisma.loanShare.findMany({
    where: {
      funderId: userId,
    },
    select: {
      repaid: true,
      createdAt: true,
    },
  });

  // Note: This is a simplification - ideally we'd track repayment dates
  const loansRepaid = loanSharesWithRepayments.reduce((sum, s) => sum + s.repaid, 0);

  // Get communities supported
  const communityAllocations = await prisma.allocation.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
    include: {
      project: {
        include: {
          communities: true,
        },
      },
    },
  });

  const uniqueCommunityIds = new Set<string>();
  for (const allocation of communityAllocations) {
    for (const cp of allocation.project.communities) {
      uniqueCommunityIds.add(cp.communityId);
    }
  }
  const communitiesSupported = uniqueCommunityIds.size;

  return {
    totalCashContributed,
    totalAdFunded,
    totalReferralCredits,
    totalMatchingReceived,
    totalAllocated,
    projectsFunded,
    loansFunded,
    loansRepaid,
    communitiesSupported,
    deductibleAmount,
    nonDeductibleAmount,
  };
}

// Get or create annual giving summary
export async function getOrCreateAnnualSummary(userId: string, year: number) {
  let summary = await prisma.annualGivingSummary.findUnique({
    where: {
      userId_year: { userId, year },
    },
  });

  if (!summary) {
    const data = await calculateAnnualGiving(userId, year);

    summary = await prisma.annualGivingSummary.create({
      data: {
        userId,
        year,
        ...data,
        generatedAt: new Date(),
      },
    });
  }

  return summary;
}

// Regenerate annual summary with fresh data
export async function regenerateAnnualSummary(userId: string, year: number) {
  const data = await calculateAnnualGiving(userId, year);

  return prisma.annualGivingSummary.upsert({
    where: {
      userId_year: { userId, year },
    },
    update: {
      ...data,
      generatedAt: new Date(),
    },
    create: {
      userId,
      year,
      ...data,
      generatedAt: new Date(),
    },
  });
}

// Get all annual summaries for a user
export async function getUserAnnualSummaries(userId: string) {
  return prisma.annualGivingSummary.findMany({
    where: { userId },
    orderBy: { year: 'desc' },
  });
}

// Get available years for a user (years with any activity)
export async function getAvailableYears(userId: string): Promise<number[]> {
  const years = new Set<number>();

  // Check contributions
  const contributions = await prisma.contribution.findMany({
    where: { userId },
    select: { createdAt: true },
  });
  contributions.forEach((c) => years.add(c.createdAt.getFullYear()));

  // Check allocations
  const allocations = await prisma.allocation.findMany({
    where: { userId },
    select: { createdAt: true },
  });
  allocations.forEach((a) => years.add(a.createdAt.getFullYear()));

  // Check ad views
  const adViews = await prisma.adView.findMany({
    where: { userId },
    select: { createdAt: true },
  });
  adViews.forEach((a) => years.add(a.createdAt.getFullYear()));

  return Array.from(years).sort((a, b) => b - a);
}

// Calculate grand totals across all types
export function calculateTotals(summary: {
  totalCashContributed: number;
  totalAdFunded: number;
  totalReferralCredits: number;
  totalMatchingReceived: number;
}) {
  return (
    summary.totalCashContributed +
    summary.totalAdFunded +
    summary.totalReferralCredits +
    summary.totalMatchingReceived
  );
}

// Format summary for display
export function formatSummaryForDisplay(summary: {
  year: number;
  totalCashContributed: number;
  totalAdFunded: number;
  totalReferralCredits: number;
  totalMatchingReceived: number;
  totalAllocated: number;
  projectsFunded: number;
  loansFunded: number;
  loansRepaid: number;
  communitiesSupported: number;
  deductibleAmount: number;
  nonDeductibleAmount: number;
}) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return {
    year: summary.year,
    totalGiving: formatCurrency(calculateTotals(summary)),
    breakdown: {
      cash: formatCurrency(summary.totalCashContributed),
      adFunded: formatCurrency(summary.totalAdFunded),
      referrals: formatCurrency(summary.totalReferralCredits),
      matching: formatCurrency(summary.totalMatchingReceived),
    },
    allocated: formatCurrency(summary.totalAllocated),
    projectsFunded: summary.projectsFunded,
    loansFunded: summary.loansFunded,
    loansRepaid: formatCurrency(summary.loansRepaid),
    communitiesSupported: summary.communitiesSupported,
    taxInfo: {
      deductible: formatCurrency(summary.deductibleAmount),
      nonDeductible: formatCurrency(summary.nonDeductibleAmount),
    },
  };
}
