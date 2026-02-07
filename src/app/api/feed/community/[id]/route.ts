import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommunityFeed } from "@/lib/activity";

// GET: community activity feed
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30");
  const offset = parseInt(searchParams.get("offset") || "0");

  const feed = await getCommunityFeed(id, limit, offset);

  return NextResponse.json(feed);
}
