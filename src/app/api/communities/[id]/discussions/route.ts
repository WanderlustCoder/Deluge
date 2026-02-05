import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const community = await prisma.community.findUnique({ where: { id } });
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const discussions = await prisma.discussion.findMany({
    where: { communityId: id },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(discussions);
}

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
      { error: "You must be a member to post discussions" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const title = sanitizeText(body.title || "");
  const content = sanitizeText(body.body || "");

  if (!title || title.length < 1 || title.length > 200) {
    return NextResponse.json(
      { error: "Title must be between 1 and 200 characters" },
      { status: 400 }
    );
  }

  if (!content || content.length < 1 || content.length > 5000) {
    return NextResponse.json(
      { error: "Body must be between 1 and 5000 characters" },
      { status: 400 }
    );
  }

  const discussion = await prisma.discussion.create({
    data: {
      communityId: id,
      userId: session.user.id,
      title,
      body: content,
    },
    include: {
      user: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(discussion, { status: 201 });
}
