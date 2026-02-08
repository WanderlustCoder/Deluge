import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishReport } from "@/lib/transparency-reports";
import { logError } from "@/lib/logger";

/**
 * POST /api/admin/financials/reports/[id]/publish
 * Publish a transparency report
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await publishReport(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/admin/financials/reports/[id]/publish", error);
    return NextResponse.json(
      { error: "Failed to publish report" },
      { status: 500 }
    );
  }
}
