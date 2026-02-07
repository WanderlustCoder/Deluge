import { prisma } from './prisma';
import { parseMatchingCategories, getUserCorporateAccount } from './corporate';

// Calculate matching amount for a contribution
export async function calculateMatch(
  userId: string,
  amount: number,
  category?: string
): Promise<{
  matchAmount: number;
  corporateAccountId: string | null;
  matchingRatio: number;
  campaignBonus: number;
}> {
  // Check if user is a corporate employee
  const employee = await prisma.corporateEmployee.findUnique({
    where: { userId },
    include: {
      corporateAccount: {
        include: {
          campaigns: {
            where: {
              status: 'active',
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
        },
      },
    },
  });

  if (!employee || employee.status !== 'active') {
    return { matchAmount: 0, corporateAccountId: null, matchingRatio: 0, campaignBonus: 0 };
  }

  const account = employee.corporateAccount;

  // Check if account is active
  if (account.status !== 'active') {
    return { matchAmount: 0, corporateAccountId: null, matchingRatio: 0, campaignBonus: 0 };
  }

  // Check matching budget
  const remaining = account.matchingBudget - account.matchingSpent;
  if (remaining <= 0) {
    return { matchAmount: 0, corporateAccountId: null, matchingRatio: 0, campaignBonus: 0 };
  }

  // Check category restrictions
  const allowedCategories = parseMatchingCategories(account.matchingCategories);
  if (allowedCategories.length > 0 && category && !allowedCategories.includes(category)) {
    return { matchAmount: 0, corporateAccountId: null, matchingRatio: 0, campaignBonus: 0 };
  }

  // Calculate base match
  let matchAmount = amount * account.matchingRatio;
  let campaignBonus = 0;

  // Check for active campaign bonus
  const activeCampaign = account.campaigns.find((c) => {
    if (!category) return true;
    const categories = c.categories ? JSON.parse(c.categories) : [];
    return categories.length === 0 || categories.includes(category);
  });

  if (activeCampaign && activeCampaign.matchingBonus) {
    campaignBonus = amount * activeCampaign.matchingBonus;
    matchAmount += campaignBonus;
  }

  // Cap at remaining budget
  matchAmount = Math.min(matchAmount, remaining);

  return {
    matchAmount,
    corporateAccountId: account.id,
    matchingRatio: account.matchingRatio,
    campaignBonus,
  };
}

// Record a matching contribution
export async function recordMatch(
  corporateAccountId: string,
  userId: string,
  originalAmount: number,
  matchedAmount: number,
  projectId?: string,
  loanId?: string,
  category?: string
) {
  // Create matching record
  const record = await prisma.corporateMatchingRecord.create({
    data: {
      corporateAccountId,
      userId,
      originalAmount,
      matchedAmount,
      projectId,
      loanId,
      category,
    },
  });

  // Update matching spent
  await prisma.corporateAccount.update({
    where: { id: corporateAccountId },
    data: {
      matchingSpent: { increment: matchedAmount },
    },
  });

  // Update campaign if applicable
  const campaign = await prisma.corporateCampaign.findFirst({
    where: {
      corporateAccountId,
      status: 'active',
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  if (campaign) {
    await prisma.corporateCampaign.update({
      where: { id: campaign.id },
      data: {
        currentAmount: { increment: originalAmount + matchedAmount },
      },
    });
  }

  return record;
}

// Get matching history for a corporate account
export async function getMatchingHistory(
  corporateAccountId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    limit?: number;
    offset?: number;
  }
) {
  const where: Record<string, unknown> = { corporateAccountId };

  if (options?.startDate || options?.endDate) {
    where.matchDate = {};
    if (options.startDate) {
      (where.matchDate as Record<string, unknown>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.matchDate as Record<string, unknown>).lte = options.endDate;
    }
  }

  if (options?.userId) {
    where.userId = options.userId;
  }

  return prisma.corporateMatchingRecord.findMany({
    where,
    orderBy: { matchDate: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

// Get matching stats for a period
export async function getMatchingStats(
  corporateAccountId: string,
  startDate: Date,
  endDate: Date
) {
  const records = await prisma.corporateMatchingRecord.findMany({
    where: {
      corporateAccountId,
      matchDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalOriginal = records.reduce((sum, r) => sum + r.originalAmount, 0);
  const totalMatched = records.reduce((sum, r) => sum + r.matchedAmount, 0);
  const uniqueEmployees = new Set(records.map((r) => r.userId)).size;
  const uniqueProjects = new Set(records.filter((r) => r.projectId).map((r) => r.projectId)).size;
  const uniqueLoans = new Set(records.filter((r) => r.loanId).map((r) => r.loanId)).size;

  // Category breakdown
  const categoryBreakdown: Record<string, { original: number; matched: number }> = {};
  for (const record of records) {
    const cat = record.category || 'uncategorized';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { original: 0, matched: 0 };
    }
    categoryBreakdown[cat].original += record.originalAmount;
    categoryBreakdown[cat].matched += record.matchedAmount;
  }

  return {
    totalOriginal,
    totalMatched,
    totalCombined: totalOriginal + totalMatched,
    uniqueEmployees,
    uniqueProjects,
    uniqueLoans,
    matchCount: records.length,
    categoryBreakdown,
  };
}

// Check if corporate matching is available for user
export async function checkMatchingAvailable(userId: string): Promise<{
  available: boolean;
  matchingRatio: number;
  budgetRemaining: number;
  companyName?: string;
}> {
  const account = await getUserCorporateAccount(userId);

  if (!account || account.status !== 'active') {
    return { available: false, matchingRatio: 0, budgetRemaining: 0 };
  }

  const remaining = account.matchingBudget - account.matchingSpent;

  return {
    available: remaining > 0,
    matchingRatio: account.matchingRatio,
    budgetRemaining: remaining,
    companyName: account.name,
  };
}
