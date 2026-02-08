import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { useGracePeriod, StreakType } from "@/lib/streaks-enhanced";
import { logError } from "@/lib/logger";

const VALID_TYPES: StreakType[] = ["ad_watch", "contributing", "login"];

// POST: Use grace period to recover a streak
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await params;

  if (!VALID_TYPES.includes(type as StreakType)) {
    return NextResponse.json({ error: "Invalid streak type" }, { status: 400 });
  }

  try {
    await useGracePeriod(session.user.id, type as StreakType);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to recover streak";
    logError("api/streaks/recover", error, { type });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
