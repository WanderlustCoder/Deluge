import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMentions, notifyMentionedUsers } from "@/lib/mentions";
import { logError } from "@/lib/logger";

// GET: Get replies to a discussion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      prisma.discussion.findMany({
        where: { parentId: id },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
          mentions: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.discussion.count({ where: { parentId: id } }),
    ]);

    return NextResponse.json({
      replies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logError("api/discussions/replies", error, { discussionId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a reply to a discussion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { body: replyBody, title } = body;

    if (!replyBody?.trim()) {
      return NextResponse.json(
        { error: "Reply body is required" },
        { status: 400 }
      );
    }

    // Get parent discussion to inherit community
    const parent = await prisma.discussion.findUnique({
      where: { id },
      select: { communityId: true, title: true },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Parent discussion not found" },
        { status: 404 }
      );
    }

    // Create the reply
    const reply = await prisma.discussion.create({
      data: {
        communityId: parent.communityId,
        userId: session.user.id,
        parentId: id,
        title: title?.trim() || `Re: ${parent.title}`,
        body: replyBody.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Process mentions
    const mentionedUserIds = await createMentions(reply.id, replyBody);
    if (mentionedUserIds.length > 0) {
      await notifyMentionedUsers(
        reply.id,
        mentionedUserIds,
        session.user.name || "Someone",
        reply.title,
        parent.communityId
      );
    }

    return NextResponse.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    logError("api/discussions/replies", error, { discussionId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
