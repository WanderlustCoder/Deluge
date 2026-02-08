import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveAction } from "@/lib/parental-controls";
import { logError } from "@/lib/logger";

/**
 * POST /api/family/pending/[id]/approve
 * Approve a pending family action
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await approveAction(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve action";
    logError("api/family/pending/[id]/approve", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
