import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFlagshipProjects, getVoteTally } from "@/lib/aquifer";

// GET: List flagship projects with optional status filter
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const flagships = await getFlagshipProjects(status);

  // Enrich with vote tallies and user's vote
  const enriched = await Promise.all(
    flagships.map(async (flagship) => {
      const tally = await getVoteTally(flagship.id);
      const userVote = flagship.votes.find((v) => v.userId === session.user!.id);

      return {
        ...flagship,
        voteTally: tally,
        userVote: userVote?.vote || null,
      };
    })
  );

  return NextResponse.json(enriched);
}
