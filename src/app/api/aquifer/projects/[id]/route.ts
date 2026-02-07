import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFlagshipProject, getVoteTally } from "@/lib/aquifer";

// GET: Get flagship project detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const flagship = await getFlagshipProject(id);

  if (!flagship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tally = await getVoteTally(flagship.id);
  const userVote = flagship.votes.find((v) => v.userId === session.user!.id);

  return NextResponse.json({
    ...flagship,
    voteTally: tally,
    userVote: userVote?.vote || null,
  });
}
