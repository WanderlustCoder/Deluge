import { prisma } from '@/lib/prisma';
import { PLATFORM_FEE_RATE, isCampaignSuccessful } from './index';

export interface SettlementResult {
  campaignId: string;
  status: 'successful' | 'failed';
  totalPledged: number;
  totalCollected: number;
  totalFailed: number;
  platformFee: number;
  netAmount: number;
  pledgesProcessed: number;
  pledgesFailed: number;
}

// Check and settle ended campaigns
export async function checkAndSettleCampaigns(): Promise<SettlementResult[]> {
  const now = new Date();

  // Find campaigns that have ended but aren't settled
  const endedCampaigns = await prisma.pledgeCampaign.findMany({
    where: {
      status: 'active',
      endDate: { lte: now },
    },
    include: {
      pledges: {
        where: { status: 'active' },
      },
    },
  });

  const results: SettlementResult[] = [];

  for (const campaign of endedCampaigns) {
    const result = await settleCampaign(campaign.id);
    results.push(result);
  }

  return results;
}

// Settle a single campaign
export async function settleCampaign(campaignId: string): Promise<SettlementResult> {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id: campaignId },
    include: {
      pledges: {
        where: { status: 'active' },
      },
    },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  if (campaign.settledAt) {
    throw new Error('Campaign already settled');
  }

  const isSuccess = isCampaignSuccessful({
    fundingType: campaign.fundingType,
    pledgedAmount: campaign.pledgedAmount,
    goalAmount: campaign.goalAmount,
    minimumAmount: campaign.minimumAmount,
  });

  if (isSuccess) {
    return await collectPledges(campaign);
  } else {
    return await releasePledges(campaign);
  }
}

// Collect pledges for successful campaign
async function collectPledges(campaign: {
  id: string;
  pledgedAmount: number;
  pledges: { id: string; amount: number; tipAmount: number }[];
}): Promise<SettlementResult> {
  let totalCollected = 0;
  let totalFailed = 0;
  let pledgesProcessed = 0;
  let pledgesFailed = 0;

  for (const pledge of campaign.pledges) {
    try {
      // In production, this would charge the stored payment method
      // For now, we simulate successful collection
      await prisma.pledge.update({
        where: { id: pledge.id },
        data: {
          status: 'collected',
          collectedAt: new Date(),
        },
      });

      totalCollected += pledge.amount + pledge.tipAmount;
      pledgesProcessed++;
    } catch {
      // Payment failed
      await prisma.pledge.update({
        where: { id: pledge.id },
        data: {
          status: 'failed',
        },
      });

      totalFailed += pledge.amount;
      pledgesFailed++;
    }
  }

  const platformFee = totalCollected * PLATFORM_FEE_RATE;
  const netAmount = totalCollected - platformFee;

  // Update campaign status
  await prisma.pledgeCampaign.update({
    where: { id: campaign.id },
    data: {
      status: 'successful',
      settledAt: new Date(),
    },
  });

  // Credit the project with the collected funds
  await prisma.project.update({
    where: { id: (await prisma.pledgeCampaign.findUnique({ where: { id: campaign.id } }))!.projectId },
    data: {
      fundingRaised: { increment: netAmount },
    },
  });

  return {
    campaignId: campaign.id,
    status: 'successful',
    totalPledged: campaign.pledgedAmount,
    totalCollected,
    totalFailed,
    platformFee,
    netAmount,
    pledgesProcessed,
    pledgesFailed,
  };
}

// Release pledges for failed campaign
async function releasePledges(campaign: {
  id: string;
  pledgedAmount: number;
  pledges: { id: string; amount: number }[];
}): Promise<SettlementResult> {
  // Cancel all pledges
  await prisma.pledge.updateMany({
    where: {
      campaignId: campaign.id,
      status: 'active',
    },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  });

  // Update campaign status
  await prisma.pledgeCampaign.update({
    where: { id: campaign.id },
    data: {
      status: 'failed',
      settledAt: new Date(),
    },
  });

  return {
    campaignId: campaign.id,
    status: 'failed',
    totalPledged: campaign.pledgedAmount,
    totalCollected: 0,
    totalFailed: 0,
    platformFee: 0,
    netAmount: 0,
    pledgesProcessed: campaign.pledges.length,
    pledgesFailed: 0,
  };
}

// Process refund for a pledge
export async function refundPledge(pledgeId: string, adminId: string, reason?: string) {
  const pledge = await prisma.pledge.findUnique({
    where: { id: pledgeId },
    include: { campaign: true },
  });

  if (!pledge) {
    throw new Error('Pledge not found');
  }

  if (pledge.status !== 'collected') {
    throw new Error('Can only refund collected pledges');
  }

  // In production, this would process a refund through the payment provider
  await prisma.pledge.update({
    where: { id: pledgeId },
    data: {
      status: 'refunded',
      refundedAt: new Date(),
    },
  });

  // Log the refund action
  console.log(`Refund processed: Pledge ${pledgeId} by admin ${adminId}. Reason: ${reason || 'Not specified'}`);

  return { success: true, pledgeId };
}

// Get settlement status for a campaign
export async function getSettlementStatus(campaignId: string) {
  const campaign = await prisma.pledgeCampaign.findUnique({
    where: { id: campaignId },
    include: {
      pledges: true,
    },
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  const pledgesByStatus = campaign.pledges.reduce((acc, pledge) => {
    acc[pledge.status] = (acc[pledge.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const amountByStatus = campaign.pledges.reduce((acc, pledge) => {
    acc[pledge.status] = (acc[pledge.status] || 0) + pledge.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    campaignId,
    status: campaign.status,
    settledAt: campaign.settledAt,
    fundingType: campaign.fundingType,
    goalAmount: campaign.goalAmount,
    pledgedAmount: campaign.pledgedAmount,
    pledgesByStatus,
    amountByStatus,
    isSuccess: isCampaignSuccessful({
      fundingType: campaign.fundingType,
      pledgedAmount: campaign.pledgedAmount,
      goalAmount: campaign.goalAmount,
      minimumAmount: campaign.minimumAmount,
    }),
  };
}

// Get campaigns pending settlement
export async function getPendingSettlements() {
  const now = new Date();

  const campaigns = await prisma.pledgeCampaign.findMany({
    where: {
      status: 'active',
      endDate: { lte: now },
      settledAt: null,
    },
    include: {
      project: { select: { id: true, title: true } },
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { pledges: true } },
    },
    orderBy: { endDate: 'asc' },
  });

  return campaigns.map(campaign => ({
    ...campaign,
    isSuccess: isCampaignSuccessful({
      fundingType: campaign.fundingType,
      pledgedAmount: campaign.pledgedAmount,
      goalAmount: campaign.goalAmount,
      minimumAmount: campaign.minimumAmount,
    }),
  }));
}

// Calculate projected settlement for a campaign
export function calculateProjectedSettlement(campaign: {
  pledgedAmount: number;
  fundingType: string;
  goalAmount: number;
  minimumAmount: number | null;
}) {
  const isSuccess = isCampaignSuccessful(campaign);

  if (!isSuccess) {
    return {
      willSucceed: false,
      projectedCollection: 0,
      platformFee: 0,
      netToProject: 0,
    };
  }

  const platformFee = campaign.pledgedAmount * PLATFORM_FEE_RATE;
  const netToProject = campaign.pledgedAmount - platformFee;

  return {
    willSucceed: true,
    projectedCollection: campaign.pledgedAmount,
    platformFee,
    netToProject,
  };
}
