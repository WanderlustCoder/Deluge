import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackShare, getShareAnalytics, SharePlatform } from "@/lib/shares";
import { logError } from "@/lib/logger";

const VALID_PLATFORMS: SharePlatform[] = ["twitter", "facebook", "email", "copy", "other"];

// POST: Track a share event
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be one of: " + VALID_PLATFORMS.join(", ") },
        { status: 400 }
      );
    }

    const share = await trackShare(id, session?.user?.id || null, platform);

    return NextResponse.json({
      success: true,
      data: share,
    });
  } catch (error) {
    logError("api/projects/share", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get share analytics for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const analytics = await getShareAnalytics(id);

    return NextResponse.json(analytics);
  } catch (error) {
    logError("api/projects/share", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
