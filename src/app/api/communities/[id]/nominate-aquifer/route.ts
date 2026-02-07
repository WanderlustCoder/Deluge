import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AQUIFER_VOTE_DURATION_DAYS } from "@/lib/constants";

// POST: Nominate a community project for Aquifer Pool funding
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: communityId } = await params;
  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  // Check if user is admin of this community
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId, userId: session.user.id },
    },
  });

  if (!membership || membership.role !== "admin") {
    return NextResponse.json(
      { error: "Only community admins/stewards can nominate projects" },
      { status: 403 }
    );
  }

  // Verify project is linked to this community
  const communityProject = await prisma.communityProject.findUnique({
    where: {
      communityId_projectId: { communityId, projectId },
    },
    include: {
      project: true,
    },
  });

  if (!communityProject) {
    return NextResponse.json(
      { error: "Project is not linked to this community" },
      { status: 400 }
    );
  }

  // Check if project already has a flagship entry
  const existingFlagship = await prisma.flagshipProject.findUnique({
    where: { projectId },
  });

  if (existingFlagship) {
    return NextResponse.json(
      { error: "This project is already in the Aquifer" },
      { status: 400 }
    );
  }

  // Check community voting - project needs >50% approval
  const [upvotes, totalVotes] = await Promise.all([
    prisma.projectVote.count({
      where: { communityId, projectId, vote: 1 },
    }),
    prisma.projectVote.count({
      where: { communityId, projectId },
    }),
  ]);

  if (totalVotes < 3) {
    return NextResponse.json(
      { error: "Project needs at least 3 community votes before nomination" },
      { status: 400 }
    );
  }

  const approvalRate = upvotes / totalVotes;
  if (approvalRate < 0.5) {
    return NextResponse.json(
      {
        error: `Project needs >50% approval (currently ${Math.round(approvalRate * 100)}%)`,
      },
      { status: 400 }
    );
  }

  // Get community name for the activity message
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { name: true },
  });

  // Create flagship project entry with pool funding source
  const votingEnds = new Date(
    Date.now() + AQUIFER_VOTE_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const flagship = await prisma.flagshipProject.create({
    data: {
      projectId,
      fundingSource: "pool",
      status: "voting",
      votingEndsAt: votingEnds,
      nominatingCommunityId: communityId,
    },
    include: {
      project: { select: { title: true } },
    },
  });

  return NextResponse.json({
    success: true,
    flagship,
    message: `${communityProject.project.title} has been nominated for Aquifer Pool funding by ${community?.name}`,
  });
}

// GET: Check if a project can be nominated
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: communityId } = await params;
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  // Check if project is linked to community
  const communityProject = await prisma.communityProject.findUnique({
    where: {
      communityId_projectId: { communityId, projectId },
    },
  });

  if (!communityProject) {
    return NextResponse.json({
      canNominate: false,
      reason: "Project is not linked to this community",
    });
  }

  // Check if already a flagship
  const existingFlagship = await prisma.flagshipProject.findUnique({
    where: { projectId },
  });

  if (existingFlagship) {
    return NextResponse.json({
      canNominate: false,
      reason: "Already in Aquifer",
    });
  }

  // Check voting
  const [upvotes, totalVotes] = await Promise.all([
    prisma.projectVote.count({
      where: { communityId, projectId, vote: 1 },
    }),
    prisma.projectVote.count({
      where: { communityId, projectId },
    }),
  ]);

  if (totalVotes < 3) {
    return NextResponse.json({
      canNominate: false,
      reason: "Needs at least 3 community votes",
      currentVotes: totalVotes,
    });
  }

  const approvalRate = totalVotes > 0 ? upvotes / totalVotes : 0;
  if (approvalRate < 0.5) {
    return NextResponse.json({
      canNominate: false,
      reason: "Needs >50% approval",
      approvalRate: Math.round(approvalRate * 100),
    });
  }

  return NextResponse.json({
    canNominate: true,
    approvalRate: Math.round(approvalRate * 100),
    totalVotes,
  });
}
