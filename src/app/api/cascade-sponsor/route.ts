import { NextResponse } from "next/server";
import { findCascadeSponsor, recordCascadeSponsorImpression } from "@/lib/cascade-sponsors";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const result = await findCascadeSponsor(projectId);

    if (!result) {
      return NextResponse.json({ sponsor: null });
    }

    // Record impression
    await recordCascadeSponsorImpression(result.eventId, 1);

    return NextResponse.json({
      sponsor: result.sponsor,
      eventId: result.eventId,
    });
  } catch (error) {
    logError("api/cascade-sponsor", error);
    return NextResponse.json(
      { error: "Failed to get sponsor" },
      { status: 500 }
    );
  }
}
