import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startElection, checkExpiredTerms, getElectedRoles } from "@/lib/elections";
import { logError } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify user is a community member
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: id, userId: session.user.id } },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only community members can start elections" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    const validRoles = ["steward", "steward:projects", "steward:finance", "steward:membership", "champion"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid election role" }, { status: 400 });
    }

    const election = await startElection(id, role, session.user.id);
    return NextResponse.json({ success: true, data: election });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already in progress")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    logError("api/communities/elections", error, {
      userId: session.user.id,
      route: `POST /api/communities/${id}/elections`,
    });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check expired terms on load
  await checkExpiredTerms(id);

  const [elections, electedRoles] = await Promise.all([
    prisma.communityElection.findMany({
      where: { communityId: id },
      include: {
        nominations: {
          include: {
            election: { select: { votes: { select: { nomineeId: true } } } },
          },
        },
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getElectedRoles(id),
  ]);

  // Compute vote counts per nominee
  const enriched = elections.map((e) => {
    const voteCounts: Record<string, number> = {};
    for (const v of e.votes) {
      voteCounts[v.nomineeId] = (voteCounts[v.nomineeId] || 0) + 1;
    }

    return {
      id: e.id,
      role: e.role,
      status: e.status,
      nominationEnd: e.nominationEnd,
      votingEnd: e.votingEnd,
      termEnd: e.termEnd,
      winnerId: e.winnerId,
      nominations: e.nominations.map((n) => ({
        nomineeId: n.nomineeId,
        nominatedBy: n.nominatedBy,
        votes: voteCounts[n.nomineeId] || 0,
      })),
      totalVotes: e.votes.length,
      userVoted: e.votes.some((v) => v.voterId === session.user!.id),
    };
  });

  return NextResponse.json({ elections: enriched, electedRoles });
}
