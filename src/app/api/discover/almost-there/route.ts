import { NextRequest, NextResponse } from "next/server";
import { getAlmostThereProjects } from "@/lib/momentum";
import { logError } from "@/lib/logger";

// GET: Get projects that are 75%+ funded (almost there!)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const projects = await getAlmostThereProjects(limit);

    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    logError("api/discover/almost-there", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
