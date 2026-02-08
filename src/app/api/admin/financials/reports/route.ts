import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllReports,
  generateTransparencyReport,
  type PeriodType,
} from "@/lib/transparency-reports";
import { logError } from "@/lib/logger";

/**
 * GET /api/admin/financials/reports
 * List all reports (including unpublished)
 */
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await getAllReports();

    return NextResponse.json({ reports });
  } catch (error) {
    logError("api/admin/financials/reports", error);
    return NextResponse.json(
      { error: "Failed to get reports" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/financials/reports
 * Generate a new report
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { period, periodType } = body as {
      period: string;
      periodType: PeriodType;
    };

    if (!period || !periodType) {
      return NextResponse.json(
        { error: "Missing period or periodType" },
        { status: 400 }
      );
    }

    const result = await generateTransparencyReport(period, periodType);

    return NextResponse.json({
      success: true,
      reportId: result.reportId,
    });
  } catch (error) {
    logError("api/admin/financials/reports", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
