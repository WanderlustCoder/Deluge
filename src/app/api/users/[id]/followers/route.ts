import { NextRequest, NextResponse } from "next/server";
import { getUserFollowers } from "@/lib/follows";
import { logError } from "@/lib/logger";

// GET: Get a user's followers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const result = await getUserFollowers(id, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    logError("api/users/followers", error, { userId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
