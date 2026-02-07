import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finalizeElection } from "@/lib/elections";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; electionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { electionId } = await params;

  const election = await prisma.communityElection.findUnique({
    where: { id: electionId },
    include: {
      nominations: true,
      votes: true,
      community: { select: { name: true, memberCount: true } },
    },
  });

  if (!election) {
    return NextResponse.json({ error: "Election not found" }, { status: 404 });
  }

  // Auto-finalize if voting period ended
  if (
    (election.status === "voting" || election.status === "nominating") &&
    new Date() > election.votingEnd
  ) {
    try {
      const result = await finalizeElection(electionId);
      return NextResponse.json({
        ...election,
        status: result.winnerId ? "completed" : "cancelled",
        winnerId: result.winnerId || null,
        finalizationReason: result.reason,
      });
    } catch {
      // Continue with current state
    }
  }

  // Count votes per nominee
  const voteCounts: Record<string, number> = {};
  for (const v of election.votes) {
    voteCounts[v.nomineeId] = (voteCounts[v.nomineeId] || 0) + 1;
  }

  return NextResponse.json({
    ...election,
    voteCounts,
    userVoted: election.votes.some((v) => v.voterId === session.user!.id),
    userNomineeVote: election.votes.find((v) => v.voterId === session.user!.id)?.nomineeId,
  });
}
