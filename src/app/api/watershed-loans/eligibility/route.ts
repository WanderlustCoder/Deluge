import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";
import {
  checkWatershedLoanEligibility,
  getAvailableWatershedBalance,
  getLendingPortfolioSummary,
  getMaxTermMonths,
  WATERSHED_LOAN_MIN_AMOUNT,
} from "@/lib/watershed-loans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const eligibility = await checkWatershedLoanEligibility(userId);
    const balanceInfo = await getAvailableWatershedBalance(userId);
    const portfolio = await getLendingPortfolioSummary(userId);

    return NextResponse.json({
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      availableBalance: eligibility.availableBalance,
      balanceBreakdown: balanceInfo,
      portfolio,
      minAmount: WATERSHED_LOAN_MIN_AMOUNT,
      termLimits: {
        "100-500": getMaxTermMonths(300),
        "501-1000": getMaxTermMonths(750),
        "1001-5000": getMaxTermMonths(3000),
        "5001+": getMaxTermMonths(6000),
      },
    });
  } catch (error) {
    logError("api/watershed-loans/eligibility", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
