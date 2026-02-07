import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import {
  BUSINESS_VIEW_REVENUE_BASE,
  PLATFORM_CUT_PERCENTAGE,
  WATERSHED_CREDIT_PERCENTAGE,
} from "@/lib/constants";

// POST: record a view and credit watershed
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const listing = await prisma.businessListing.findUnique({
      where: { id },
    });

    if (!listing || !listing.isActive) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Can't view your own listing for revenue
    if (listing.ownerId === session.user.id) {
      return NextResponse.json({ viewRecorded: false, reason: "own_listing" });
    }

    // Check if user has already viewed this listing in the last hour
    const recentView = await prisma.businessView.findFirst({
      where: {
        listingId: id,
        viewerId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
      },
    });

    if (recentView) {
      return NextResponse.json({ viewRecorded: false, reason: "recent_view" });
    }

    // Calculate revenue (slightly randomized around base)
    const variance = 0.5 + Math.random(); // 0.5x to 1.5x multiplier
    const revenue = BUSINESS_VIEW_REVENUE_BASE * variance;
    const platformCut = revenue * PLATFORM_CUT_PERCENTAGE;
    const watershedCredit = revenue * WATERSHED_CREDIT_PERCENTAGE;

    // Get viewer's watershed
    const watershed = await prisma.watershed.findUnique({
      where: { userId: session.user.id },
    });

    if (!watershed) {
      return NextResponse.json(
        { error: "Watershed not found" },
        { status: 400 }
      );
    }

    const newBalance = watershed.balance + watershedCredit;

    await prisma.$transaction([
      prisma.businessView.create({
        data: {
          listingId: id,
          viewerId: session.user.id,
          revenue,
          platformCut,
        },
      }),
      prisma.watershed.update({
        where: { userId: session.user.id },
        data: {
          balance: newBalance,
          totalInflow: { increment: watershedCredit },
        },
      }),
      prisma.watershedTransaction.create({
        data: {
          watershedId: watershed.id,
          type: "business_view",
          amount: watershedCredit,
          description: `Viewed business: ${listing.name}`,
          balanceAfter: newBalance,
        },
      }),
    ]);

    return NextResponse.json({
      viewRecorded: true,
      revenue,
      watershedCredit,
      newBalance,
    });
  } catch (error) {
    logError("api/business/view", error, {
      userId: session.user.id,
      route: `POST /api/business/${id}/view`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
