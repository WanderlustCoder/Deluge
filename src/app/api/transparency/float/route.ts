import { NextResponse } from "next/server";
import { getFloatMetrics, getUserFloatContribution } from "@/lib/float-income";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

/**
 * GET /api/transparency/float
 * Public endpoint with optional user-specific data if authenticated
 */
export async function GET() {
  try {
    const session = await auth();
    const metrics = await getFloatMetrics();

    // Add user-specific contribution if logged in
    let userContribution = null;
    if (session?.user?.id) {
      userContribution = await getUserFloatContribution(session.user.id);
    }

    return NextResponse.json({
      ...metrics,
      userContribution,
    });
  } catch (error) {
    logError("api/transparency/float", error);
    return NextResponse.json(
      { error: "Failed to get float metrics" },
      { status: 500 }
    );
  }
}
