import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChallenge } from "@/lib/challenges";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const challenge = await getChallenge(id);

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  return NextResponse.json(challenge);
}
