import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllStreaks } from "@/lib/streaks-enhanced";
import { logError } from "@/lib/logger";

// GET: Get all streaks for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const streaks = await getAllStreaks(session.user.id);

    return NextResponse.json({ streaks });
  } catch (error) {
    logError("api/streaks", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
