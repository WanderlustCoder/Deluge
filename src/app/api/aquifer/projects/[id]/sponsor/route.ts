import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sponsorFlagshipProject, checkReactivation } from "@/lib/aquifer";
import { logError } from "@/lib/logger";

// POST: Sponsor a tabled flagship project
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sponsor = await sponsorFlagshipProject(id, session.user.id);
    const reactivationStatus = await checkReactivation(id);

    return NextResponse.json({
      success: true,
      data: sponsor,
      reactivation: reactivationStatus,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { id } = await params;
    logError("api/aquifer/projects/sponsor", error, { userId: session.user.id, flagshipId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
