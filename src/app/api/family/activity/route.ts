import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFamily } from "@/lib/family";
import { getFamilyActivity } from "@/lib/family-impact";
import { logError } from "@/lib/logger";

/**
 * GET /api/family/activity
 * Get family activity feed
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ activity: [] });
    }

    const activity = await getFamilyActivity(family.id, limit);

    return NextResponse.json({ activity });
  } catch (error) {
    logError("api/family/activity", error);
    return NextResponse.json(
      { error: "Failed to get activity" },
      { status: 500 }
    );
  }
}
