import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRevenueBreakdown, getRevenueTrends } from "@/lib/revenue-tracking";
import { logError } from "@/lib/logger";

/**
 * GET /api/admin/financials/revenue
 * Admin-only detailed revenue data
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    let startDate: Date;
    let endDate = new Date();

    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      // Default to last month
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const [breakdown, trends] = await Promise.all([
      getRevenueBreakdown(startDate, endDate),
      getRevenueTrends(period as "week" | "month" | "quarter" | "year"),
    ]);

    return NextResponse.json({
      breakdown,
      trends,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    logError("api/admin/financials/revenue", error);
    return NextResponse.json(
      { error: "Failed to get revenue data" },
      { status: 500 }
    );
  }
}
