import { NextResponse } from "next/server";
import { getPublicTransparencyMetrics } from "@/lib/revenue-tracking";
import { logError } from "@/lib/logger";

/**
 * GET /api/transparency
 * Public endpoint - no auth required
 */
export async function GET() {
  try {
    const metrics = await getPublicTransparencyMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    logError("api/transparency", error);
    return NextResponse.json(
      { error: "Failed to get transparency metrics" },
      { status: 500 }
    );
  }
}
