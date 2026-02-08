import { NextRequest, NextResponse } from "next/server";
import { getTopMomentumProjects } from "@/lib/momentum";
import { logError } from "@/lib/logger";

// GET: Get trending projects by momentum score
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const category = searchParams.get("category") || undefined;
    const location = searchParams.get("location") || undefined;

    const projects = await getTopMomentumProjects(limit, {
      category,
      location,
    });

    return NextResponse.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    logError("api/discover/trending", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
