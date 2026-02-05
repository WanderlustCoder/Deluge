import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCronRequest } from "@/lib/cron-auth";
import { REFERRAL_RETENTION_CREDIT, REFERRAL_RETENTION_DAYS, REFERRAL_RETENTION_MIN_LOGINS } from "@/lib/constants";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - REFERRAL_RETENTION_DAYS);

    // Find activated referrals that are 30+ days old, have no retention credit,
    // and haven't been checked yet
    const eligibleReferrals = await prisma.referral.findMany({
      where: {
        status: "activated",
        retentionCredit: 0,
        retentionCheckedAt: null,
        activatedAt: { lt: retentionCutoff },
        referredId: { not: null },
      },
      include: {
        referrer: { include: { watershed: true } },
      },
    });

    let creditedCount = 0;
    let checkedCount = 0;

    for (const referral of eligibleReferrals) {
      if (!referral.referredId) continue;

      // Check if the referred user has 5+ ad views in the past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - REFERRAL_RETENTION_DAYS);

      const recentAdViews = await prisma.adView.count({
        where: {
          userId: referral.referredId,
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      if (recentAdViews >= REFERRAL_RETENTION_MIN_LOGINS) {
        // Credit the referrer
        const referrerWatershed = referral.referrer.watershed;
        if (referrerWatershed) {
          const newBalance = referrerWatershed.balance + REFERRAL_RETENTION_CREDIT;

          await prisma.$transaction([
            prisma.referral.update({
              where: { id: referral.id },
              data: {
                retentionCredit: REFERRAL_RETENTION_CREDIT,
                retentionCheckedAt: new Date(),
              },
            }),
            prisma.watershed.update({
              where: { userId: referral.referrerId },
              data: {
                balance: newBalance,
                totalInflow: { increment: REFERRAL_RETENTION_CREDIT },
              },
            }),
            prisma.watershedTransaction.create({
              data: {
                watershedId: referrerWatershed.id,
                type: "referral_retention",
                amount: REFERRAL_RETENTION_CREDIT,
                description: "Referral retention milestone bonus",
                balanceAfter: newBalance,
              },
            }),
          ]);

          creditedCount++;
        }
      } else {
        // Mark as checked but not credited yet
        await prisma.referral.update({
          where: { id: referral.id },
          data: { retentionCheckedAt: new Date() },
        });
      }

      checkedCount++;
    }

    return NextResponse.json({
      success: true,
      checked: checkedCount,
      credited: creditedCount,
    });
  } catch (error) {
    logError("cron/referral-retention", error, {
      route: "POST /api/cron/referral-retention",
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
