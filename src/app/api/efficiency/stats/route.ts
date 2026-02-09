import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";
import { getPlatformEfficiencyStats } from "@/lib/efficiency";

// GET: Platform-wide efficiency stats
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getPlatformEfficiencyStats();
    return NextResponse.json(stats);
  } catch (error) {
    logError("api/efficiency/stats", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
