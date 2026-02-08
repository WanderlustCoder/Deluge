import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCosts, recordCost } from "@/lib/revenue-tracking";
import { logError } from "@/lib/logger";

/**
 * GET /api/admin/financials/costs
 * Admin-only cost tracking
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    let startDate: Date;
    let endDate = new Date();

    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      // Default to current month
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    const costs = await getCosts(startDate, endDate);

    return NextResponse.json({
      ...costs,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    logError("api/admin/financials/costs", error);
    return NextResponse.json(
      { error: "Failed to get costs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/financials/costs
 * Record a cost entry
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { date, category, description, amount } = body as {
      date: string;
      category: string;
      description: string;
      amount: number;
    };

    if (!category || !description || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await recordCost({
      date: new Date(date || new Date()),
      category,
      description,
      amount,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/admin/financials/costs", error);
    return NextResponse.json(
      { error: "Failed to record cost" },
      { status: 500 }
    );
  }
}
