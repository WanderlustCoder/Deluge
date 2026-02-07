import { prisma } from './prisma';
import { nanoid } from 'nanoid';

// Generate a unique receipt number
function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const id = nanoid(8).toUpperCase();
  return `DLG-${year}-${id}`;
}

// Create a receipt for a cash contribution
export async function createContributionReceipt(
  userId: string,
  contributionId: string,
  amount: number
) {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribution) {
    throw new Error('Contribution not found');
  }

  return prisma.contributionReceipt.create({
    data: {
      userId,
      contributionId,
      type: contribution.type === 'cash' ? 'cash' : 'cash',
      amount,
      date: contribution.createdAt,
      receiptNumber: generateReceiptNumber(),
    },
  });
}

// Create a receipt for a project allocation (funding)
export async function createAllocationReceipt(
  userId: string,
  allocationId: string
) {
  const allocation = await prisma.allocation.findUnique({
    where: { id: allocationId },
    include: {
      project: {
        include: {
          communities: {
            include: {
              community: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!allocation) {
    throw new Error('Allocation not found');
  }

  const communityName = allocation.project.communities[0]?.community.name || null;

  return prisma.contributionReceipt.create({
    data: {
      userId,
      allocationId,
      type: 'ad_funded', // Could be ad_funded or cash depending on source
      amount: allocation.amount,
      date: allocation.createdAt,
      projectName: allocation.project.title,
      communityName,
      receiptNumber: generateReceiptNumber(),
    },
  });
}

// Create a receipt for referral credit
export async function createReferralReceipt(
  userId: string,
  amount: number,
  date: Date
) {
  return prisma.contributionReceipt.create({
    data: {
      userId,
      type: 'referral',
      amount,
      date,
      receiptNumber: generateReceiptNumber(),
    },
  });
}

// Create a receipt for matching contribution
export async function createMatchingReceipt(
  userId: string,
  allocationId: string,
  matchAmount: number,
  projectName: string
) {
  return prisma.contributionReceipt.create({
    data: {
      userId,
      allocationId,
      type: 'matching',
      amount: matchAmount,
      date: new Date(),
      projectName,
      receiptNumber: generateReceiptNumber(),
    },
  });
}

// Get all receipts for a user
export async function getUserReceipts(userId: string, year?: number) {
  const whereClause: Record<string, unknown> = { userId };

  if (year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    whereClause.date = {
      gte: startOfYear,
      lt: endOfYear,
    };
  }

  return prisma.contributionReceipt.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
  });
}

// Get a single receipt by ID
export async function getReceipt(receiptId: string, userId: string) {
  return prisma.contributionReceipt.findFirst({
    where: {
      id: receiptId,
      userId,
    },
  });
}

// Get a receipt by receipt number
export async function getReceiptByNumber(receiptNumber: string) {
  return prisma.contributionReceipt.findUnique({
    where: { receiptNumber },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

// Mark a receipt as downloaded
export async function markReceiptDownloaded(receiptId: string) {
  return prisma.contributionReceipt.update({
    where: { id: receiptId },
    data: { downloadedAt: new Date() },
  });
}

// Get receipt statistics for a user
export async function getReceiptStats(userId: string, year: number) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const receipts = await prisma.contributionReceipt.findMany({
    where: {
      userId,
      date: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const stats = {
    totalReceipts: receipts.length,
    totalAmount: 0,
    byType: {} as Record<string, { count: number; amount: number }>,
  };

  for (const receipt of receipts) {
    stats.totalAmount += receipt.amount;

    if (!stats.byType[receipt.type]) {
      stats.byType[receipt.type] = { count: 0, amount: 0 };
    }
    stats.byType[receipt.type].count++;
    stats.byType[receipt.type].amount += receipt.amount;
  }

  return stats;
}

// Format receipt data for display
export function formatReceiptForDisplay(receipt: {
  receiptNumber: string;
  type: string;
  amount: number;
  date: Date;
  projectName?: string | null;
  communityName?: string | null;
}) {
  const typeLabels: Record<string, string> = {
    cash: 'Cash Contribution',
    ad_funded: 'Ad-Supported Giving',
    referral: 'Referral Credit',
    matching: 'Matching Contribution',
  };

  return {
    ...receipt,
    typeLabel: typeLabels[receipt.type] || receipt.type,
    formattedAmount: `$${receipt.amount.toFixed(2)}`,
    formattedDate: receipt.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}
