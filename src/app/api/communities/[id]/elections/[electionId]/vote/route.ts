import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { castVote } from "@/lib/elections";
import { logError } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; electionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, electionId } = await params;

  try {
    const body = await request.json();
    const nomineeId = body.nomineeId;

    if (!nomineeId) {
      return NextResponse.json({ error: "nomineeId is required" }, { status: 400 });
    }

    await castVote(electionId, session.user.id, nomineeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("api/elections/vote", error, {
      userId: session.user.id,
      route: `POST /api/communities/${id}/elections/${electionId}/vote`,
    });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
