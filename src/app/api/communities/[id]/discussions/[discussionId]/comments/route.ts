import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; discussionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, discussionId } = await params;

  // Check membership
  const membership = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: id, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "You must be a member to comment" },
      { status: 403 }
    );
  }

  // Check discussion exists in this community
  const discussion = await prisma.discussion.findFirst({
    where: { id: discussionId, communityId: id },
  });
  if (!discussion) {
    return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = sanitizeText(body.body || "");

  if (!content || content.length < 1 || content.length > 2000) {
    return NextResponse.json(
      { error: "Comment must be between 1 and 2000 characters" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      discussionId,
      userId: session.user.id,
      body: content,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
