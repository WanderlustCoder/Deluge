import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCronRequest } from "@/lib/cron-auth";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Expire pending referrals older than 30 days
    const result = await prisma.referral.updateMany({
      where: {
        status: "pending",
        createdAt: { lt: thirtyDaysAgo },
      },
      data: {
        status: "expired",
      },
    });

    return NextResponse.json({
      success: true,
      expiredReferrals: result.count,
    });
  } catch (error) {
    logError("cron/expire-referrals", error, { route: "POST /api/cron/expire-referrals" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
