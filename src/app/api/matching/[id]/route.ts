import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// GET: get a matching campaign
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.matchingCampaign.findUnique({
    where: { id },
    include: {
      _count: { select: { matches: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}

// PATCH: update a matching campaign (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      { error: "Only admins can update matching campaigns" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const campaign = await prisma.matchingCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updated = await prisma.matchingCampaign.update({
      where: { id },
      data: {
        status: body.status,
        // Allow pausing/resuming
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logError("api/matching/[id]", error, {
      userId: session.user.id,
      route: `PATCH /api/matching/${id}`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
