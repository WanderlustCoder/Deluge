import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  followUser,
  unfollowUser,
  followCommunity,
  unfollowCommunity,
  isFollowing,
  FollowTargetType,
} from "@/lib/follows";
import { toggleFollow } from "@/lib/project-follow";
import { logError } from "@/lib/logger";

// POST: Follow a user, project, or community
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetType, targetId } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId are required" },
        { status: 400 }
      );
    }

    if (!["user", "project", "community"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid targetType" },
        { status: 400 }
      );
    }

    switch (targetType as FollowTargetType) {
      case "user":
        await followUser(session.user.id, targetId);
        break;
      case "project":
        await toggleFollow(targetId, session.user.id);
        break;
      case "community":
        await followCommunity(session.user.id, targetId);
        break;
    }

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    logError("api/follow", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Unfollow a user, project, or community
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType") as FollowTargetType;
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId are required" },
        { status: 400 }
      );
    }

    switch (targetType) {
      case "user":
        await unfollowUser(session.user.id, targetId);
        break;
      case "project":
        await toggleFollow(targetId, session.user.id);
        break;
      case "community":
        await unfollowCommunity(session.user.id, targetId);
        break;
    }

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    logError("api/follow", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET: Check if following
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType") as FollowTargetType;
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId are required" },
        { status: 400 }
      );
    }

    const following = await isFollowing(session.user.id, targetType, targetId);

    return NextResponse.json({ following });
  } catch (error) {
    logError("api/follow", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
