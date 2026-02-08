import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFamily } from "@/lib/family";
import { getFamilyImpact, getMemberContributions } from "@/lib/family-impact";
import { logError } from "@/lib/logger";

/**
 * GET /api/family/impact
 * Get combined family impact stats
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ impact: null });
    }

    const [impact, contributions] = await Promise.all([
      getFamilyImpact(family.id),
      getMemberContributions(family.id),
    ]);

    return NextResponse.json({
      impact,
      contributions,
    });
  } catch (error) {
    logError("api/family/impact", error);
    return NextResponse.json(
      { error: "Failed to get impact" },
      { status: 500 }
    );
  }
}
