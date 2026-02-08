import { NextResponse } from "next/server";
import { trackSponsorClick } from "@/lib/cascade-sponsors";
import { trackNotificationClick } from "@/lib/notification-sponsors";
import { logError } from "@/lib/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { type } = body as { type?: "cascade" | "notification" };

    if (type === "notification") {
      await trackNotificationClick(eventId);
    } else {
      // Default to cascade sponsor
      await trackSponsorClick(eventId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { eventId } = await params;
    logError("api/sponsors/click", error, { eventId });
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
