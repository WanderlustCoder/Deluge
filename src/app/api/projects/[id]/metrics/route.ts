import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordMetric, getProjectMetrics, getMetricTemplates } from "@/lib/impact-metrics";
import { logError } from "@/lib/logger";

// GET: Get impact metrics for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { category: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const metrics = await getProjectMetrics(id);
    const templates = getMetricTemplates(project.category);

    return NextResponse.json({
      metrics,
      templates,
    });
  } catch (error) {
    logError("api/projects/metrics", error, { projectId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Record a new impact metric (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, value, unit } = body;

    if (!name?.trim() || value === undefined || !unit?.trim()) {
      return NextResponse.json(
        { error: "Name, value, and unit are required" },
        { status: 400 }
      );
    }

    if (typeof value !== "number" || value < 0) {
      return NextResponse.json(
        { error: "Value must be a positive number" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const metric = await recordMetric(id, name.trim(), value, unit.trim());

    return NextResponse.json({
      success: true,
      data: metric,
    });
  } catch (error) {
    logError("api/projects/metrics", error, {
      projectId: id,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
