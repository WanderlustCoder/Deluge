import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFeed, markAllAsRead, FeedActionType } from "@/lib/feed";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// GET: Get user's personalized feed
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "feed"; // "feed" or "notifications"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const actionTypesParam = searchParams.get("actionTypes");

    // Legacy: if type=notifications, return notifications
    if (type === "notifications") {
      const offset = (page - 1) * limit;
      const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });
      return NextResponse.json(notifications);
    }

    // New: personalized feed
    const filter: {
      unreadOnly?: boolean;
      actionTypes?: FeedActionType[];
    } = {};

    if (unreadOnly) {
      filter.unreadOnly = true;
    }

    if (actionTypesParam) {
      filter.actionTypes = actionTypesParam.split(",") as FeedActionType[];
    }

    const feed = await getFeed(session.user.id, page, limit, filter);

    return NextResponse.json(feed);
  } catch (error) {
    logError("api/feed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Mark all feed items as read
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "mark_all_read") {
      await markAllAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    logError("api/feed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
