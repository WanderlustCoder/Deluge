import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markAsRead } from "@/lib/feed";
import { logError } from "@/lib/logger";

// POST: Mark a feed item as read
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
    await markAsRead(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/feed/read", error, { feedItemId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
