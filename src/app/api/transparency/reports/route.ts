import { NextResponse } from "next/server";
import { getPublishedReports } from "@/lib/transparency-reports";
import { logError } from "@/lib/logger";

/**
 * GET /api/transparency/reports
 * Public endpoint - shows published reports
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const reports = await getPublishedReports(limit);

    return NextResponse.json({ reports });
  } catch (error) {
    logError("api/transparency/reports", error);
    return NextResponse.json(
      { error: "Failed to get reports" },
      { status: 500 }
    );
  }
}
