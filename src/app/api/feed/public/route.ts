import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPublicFeed } from "@/lib/activity";

// GET: platform-wide public feed
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const feed = await getPublicFeed(limit, offset);

  return NextResponse.json(feed);
}
