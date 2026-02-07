import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAggregatedCommunityFeed } from "@/lib/activity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const feed = await getAggregatedCommunityFeed(id, limit);

  // Serialize dates as ISO strings
  const serialized = feed.map((item) => ({
    ...item,
    timestamp: item.timestamp.toISOString(),
  }));

  return NextResponse.json(serialized);
}
