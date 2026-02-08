import { NextResponse } from "next/server";
import {
  calculateMomentumScore,
  getMomentumTrend,
  updateProjectMomentum,
} from "@/lib/momentum";
import { logError } from "@/lib/logger";

// GET: Get momentum score and trend for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [score, trend] = await Promise.all([
      calculateMomentumScore(id),
      getMomentumTrend(id),
    ]);

    return NextResponse.json({
      projectId: id,
      score,
      trend,
    });
  } catch (error) {
    logError("api/projects/momentum", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Force update momentum score (admin/cron)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const score = await updateProjectMomentum(id);

    return NextResponse.json({
      success: true,
      projectId: id,
      score,
    });
  } catch (error) {
    logError("api/projects/momentum", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
