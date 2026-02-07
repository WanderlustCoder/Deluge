import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityGoals, createCommunityGoal } from "@/lib/community-goals";
import { PROJECT_CATEGORIES } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const goals = await getCommunityGoals(id);
  return NextResponse.json(goals);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check if user is admin of this community
  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId: id, userId: session.user.id },
    },
  });

  if (!membership || membership.role !== "admin") {
    return NextResponse.json(
      { error: "Only community admins can create goals" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { title, description, targetAmount, deadline, category } = body;

  // Validation
  if (!title || !description || !targetAmount || !deadline) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (targetAmount < 10 || targetAmount > 100000) {
    return NextResponse.json(
      { error: "Target amount must be between $10 and $100,000" },
      { status: 400 }
    );
  }

  const deadlineDate = new Date(deadline);
  if (deadlineDate <= new Date()) {
    return NextResponse.json(
      { error: "Deadline must be in the future" },
      { status: 400 }
    );
  }

  if (category && !PROJECT_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const goal = await createCommunityGoal({
    communityId: id,
    title,
    description,
    targetAmount,
    deadline: deadlineDate,
    category,
    createdBy: session.user.id,
  });

  return NextResponse.json(goal);
}
