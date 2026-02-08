import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { denyAction } from "@/lib/parental-controls";
import { logError } from "@/lib/logger";

/**
 * POST /api/family/pending/[id]/deny
 * Deny a pending family action
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
    const body = await request.json();
    const { note } = body as { note?: string };

    await denyAction(id, session.user.id, note);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to deny action";
    logError("api/family/pending/[id]/deny", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
