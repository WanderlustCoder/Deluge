import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFamily } from "@/lib/family";
import { getPendingActions } from "@/lib/parental-controls";
import { logError } from "@/lib/logger";

/**
 * GET /api/family/pending
 * Get pending approvals for family admins
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json({ pending: [] });
    }

    // Only admins can see pending actions
    if (family.currentMember.role !== "admin") {
      return NextResponse.json({ pending: [] });
    }

    const pending = await getPendingActions(family.id);

    return NextResponse.json({ pending });
  } catch (error) {
    logError("api/family/pending", error);
    return NextResponse.json(
      { error: "Failed to get pending actions" },
      { status: 500 }
    );
  }
}
