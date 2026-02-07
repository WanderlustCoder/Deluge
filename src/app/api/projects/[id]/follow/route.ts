import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleFollow, isFollowing, getFollowerCount } from "@/lib/project-follow";
import { logError } from "@/lib/logger";

// GET: Check if current user is following and get follower count
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    const count = await getFollowerCount(id);
    let following = false;

    if (session?.user?.id) {
      following = await isFollowing(session.user.id, id);
    }

    return NextResponse.json({
      following,
      followerCount: count,
    });
  } catch (error) {
    logError("api/projects/follow", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Toggle follow status
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await toggleFollow(session.user.id, id);
    const count = await getFollowerCount(id);

    return NextResponse.json({
      success: true,
      following: result.following,
      followerCount: count,
    });
  } catch (error) {
    logError("api/projects/follow", error, {
      projectId: id,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
