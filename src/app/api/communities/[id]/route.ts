import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      projects: {
        include: { project: true },
        orderBy: { createdAt: "desc" },
      },
      votes: true,
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Compute vote tallies per project and user's vote
  const voteTallies: Record<string, { upvotes: number; downvotes: number; userVote: number }> = {};
  for (const vote of community.votes) {
    if (!voteTallies[vote.projectId]) {
      voteTallies[vote.projectId] = { upvotes: 0, downvotes: 0, userVote: 0 };
    }
    if (vote.vote === 1) voteTallies[vote.projectId].upvotes++;
    if (vote.vote === -1) voteTallies[vote.projectId].downvotes++;
    if (vote.userId === session.user.id) {
      voteTallies[vote.projectId].userVote = vote.vote;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { votes, ...communityWithoutVotes } = community;

  return NextResponse.json({ ...communityWithoutVotes, voteTallies });
}
