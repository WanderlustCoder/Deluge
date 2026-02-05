import { prisma } from "@/lib/prisma";
import {
  REFERRAL_ACTION_CREDIT,
  REFERRAL_ACTION_AD_THRESHOLD,
  REFERRAL_ACTION_CONTRIBUTION_THRESHOLD,
} from "@/lib/constants";

/**
 * Check if a user has completed their first action (5 ads or $5 contribution)
 * and credit their referrer if so.
 */
export async function checkFirstActionReferral(userId: string) {
  // Find if this user was referred and referral is still at signed_up
  const referral = await prisma.referral.findFirst({
    where: {
      referredId: userId,
      status: "signed_up",
    },
  });

  if (!referral) return;

  // Check ad views
  const adCount = await prisma.adView.count({ where: { userId } });
  // Check contribution total
  const contribAgg = await prisma.contribution.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const totalContributed = contribAgg._sum.amount ?? 0;

  const qualified =
    adCount >= REFERRAL_ACTION_AD_THRESHOLD ||
    totalContributed >= REFERRAL_ACTION_CONTRIBUTION_THRESHOLD;

  if (!qualified) return;

  // Credit referrer
  const referrerWatershed = await prisma.watershed.findUnique({
    where: { userId: referral.referrerId },
  });

  if (!referrerWatershed) return;

  const newBalance = referrerWatershed.balance + REFERRAL_ACTION_CREDIT;

  await prisma.$transaction([
    prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "activated",
        actionCredit: REFERRAL_ACTION_CREDIT,
        activatedAt: new Date(),
      },
    }),
    prisma.watershed.update({
      where: { userId: referral.referrerId },
      data: {
        balance: newBalance,
        totalInflow: { increment: REFERRAL_ACTION_CREDIT },
      },
    }),
    prisma.watershedTransaction.create({
      data: {
        watershedId: referrerWatershed.id,
        type: "referral_action",
        amount: REFERRAL_ACTION_CREDIT,
        description: "Referral bonus: friend completed first action",
        balanceAfter: newBalance,
      },
    }),
  ]);
}
