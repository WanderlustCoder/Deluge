import { NextResponse } from "next/server";
import { getRevenueTrends } from "@/lib/revenue-tracking";
import { logError } from "@/lib/logger";

/**
 * GET /api/transparency/revenue
 * Public endpoint - shows aggregated revenue trends
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "month") as
      | "week"
      | "month"
      | "quarter"
      | "year";

    const trends = await getRevenueTrends(period);

    // Only expose totals, not detailed breakdowns
    return NextResponse.json({
      period,
      current: trends.current,
      previous: trends.previous,
      change: trends.change,
      changePercent: trends.changePercent,
      trend: trends.trend,
      // Group sources into categories for public view
      breakdown: {
        userActivity: (trends.bySource.ads?.current || 0) + (trends.bySource.directory?.current || 0),
        floatIncome: trends.bySource.float?.current || 0,
        partnerships: (trends.bySource.corporate?.current || 0) +
          (trends.bySource.cascade_sponsor?.current || 0) +
          (trends.bySource.notification_sponsor?.current || 0),
        loans: trends.bySource.loans?.current || 0,
      },
    });
  } catch (error) {
    logError("api/transparency/revenue", error);
    return NextResponse.json(
      { error: "Failed to get revenue data" },
      { status: 500 }
    );
  }
}
