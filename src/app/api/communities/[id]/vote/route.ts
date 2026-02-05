import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check membership
  const membership = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: id, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "You must be a member to vote" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { projectId, vote } = body;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  if (![1, -1, 0].includes(vote)) {
    return NextResponse.json(
      { error: "vote must be 1, -1, or 0" },
      { status: 400 }
    );
  }

  // Verify project is linked to this community
  const communityProject = await prisma.communityProject.findUnique({
    where: { communityId_projectId: { communityId: id, projectId } },
  });
  if (!communityProject) {
    return NextResponse.json(
      { error: "Project is not linked to this community" },
      { status: 400 }
    );
  }

  if (vote === 0) {
    // Remove vote
    await prisma.projectVote.deleteMany({
      where: {
        communityId: id,
        projectId,
        userId: session.user.id,
      },
    });
  } else {
    // Upsert vote
    await prisma.projectVote.upsert({
      where: {
        communityId_projectId_userId: {
          communityId: id,
          projectId,
          userId: session.user.id,
        },
      },
      create: {
        communityId: id,
        projectId,
        userId: session.user.id,
        vote,
      },
      update: { vote },
    });
  }

  // Get updated tally
  const [upvotes, downvotes] = await Promise.all([
    prisma.projectVote.count({
      where: { communityId: id, projectId, vote: 1 },
    }),
    prisma.projectVote.count({
      where: { communityId: id, projectId, vote: -1 },
    }),
  ]);

  return NextResponse.json({ projectId, upvotes, downvotes });
}
