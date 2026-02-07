import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinChallenge } from "@/lib/challenges";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: challengeId } = await params;
  const body = await request.json();
  const { communityId } = body;

  if (!communityId) {
    return NextResponse.json(
      { error: "Community ID is required" },
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
      { error: "Only community admins can join challenges" },
      { status: 403 }
    );
  }

  try {
    const entry = await joinChallenge(challengeId, communityId);
    return NextResponse.json(entry);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to join challenge";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
