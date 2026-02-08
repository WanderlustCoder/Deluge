import { NextResponse } from "next/server";
import { getReport } from "@/lib/transparency-reports";
import { logError } from "@/lib/logger";

/**
 * GET /api/transparency/reports/[id]
 * Public endpoint - shows a specific published report
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await getReport(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Only show if published
    if (!report.publishedAt) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    logError("api/transparency/reports/[id]", error);
    return NextResponse.json(
      { error: "Failed to get report" },
      { status: 500 }
    );
  }
}
