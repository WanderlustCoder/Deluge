import { NextRequest, NextResponse } from "next/server";
import { getNewProjects } from "@/lib/momentum";
import { logError } from "@/lib/logger";

// GET: Get recently created projects (last 14 days)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const projects = await getNewProjects(limit);

    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    logError("api/discover/new", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
