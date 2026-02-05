import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCronRequest } from "@/lib/cron-auth";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Yesterday at start of day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Find streaks where lastActiveDate is before yesterday (missed a day)
    const staleStreaks = await prisma.streak.findMany({
      where: {
        currentDays: { gt: 0 },
        lastActiveDate: { lt: yesterday },
      },
    });

    let resetCount = 0;

    if (staleStreaks.length > 0) {
      const result = await prisma.streak.updateMany({
        where: {
          id: { in: staleStreaks.map((s) => s.id) },
        },
        data: {
          currentDays: 0,
        },
      });
      resetCount = result.count;
    }

    return NextResponse.json({
      success: true,
      resetStreaks: resetCount,
    });
  } catch (error) {
    logError("cron/reset-streaks", error, { route: "POST /api/cron/reset-streaks" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
