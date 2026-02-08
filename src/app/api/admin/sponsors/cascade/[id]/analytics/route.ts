import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSponsorAnalytics } from "@/lib/cascade-sponsors";
import { logError } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const analytics = await getSponsorAnalytics(id);

    if (!analytics) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    return NextResponse.json(analytics);
  } catch (error) {
    logError("api/admin/sponsors/cascade/[id]/analytics", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}
