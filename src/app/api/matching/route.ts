import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { matchingCampaignSchema } from "@/lib/validation";

// GET: list active matching campaigns
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const category = searchParams.get("category");
  const includeAll = searchParams.get("includeAll") === "true";

  const now = new Date();

  const where: Record<string, unknown> = includeAll
    ? {}
    : {
        status: "active",
        startsAt: { lte: now },
        endsAt: { gte: now },
        remainingBudget: { gt: 0 },
      };

  // Filter by target
  if (projectId) {
    where.OR = [
      { targetType: "all" },
      { targetType: "project", targetValue: projectId },
    ];
  } else if (category) {
    where.OR = [
      { targetType: "all" },
      { targetType: "category", targetValue: category },
    ];
  }

  const campaigns = await prisma.matchingCampaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

// POST: create a matching campaign (admin only)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accountType: true },
  });

  if (user?.accountType !== "admin") {
    return NextResponse.json(
      { error: "Only admins can create matching campaigns" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = matchingCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const campaign = await prisma.matchingCampaign.create({
      data: {
        name: parsed.data.name,
        corporateName: parsed.data.corporateName,
        description: parsed.data.description,
        logoUrl: parsed.data.logoUrl || null,
        matchRatio: parsed.data.matchRatio,
        totalBudget: parsed.data.totalBudget,
        remainingBudget: parsed.data.totalBudget,
        targetType: parsed.data.targetType,
        targetValue: parsed.data.targetValue || null,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: new Date(parsed.data.endsAt),
        status: "active",
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    logError("api/matching", error, {
      userId: session.user.id,
      route: "POST /api/matching",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
