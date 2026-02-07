import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Retail",
  "Services",
  "Health & Wellness",
  "Home Services",
  "Professional",
  "Entertainment",
  "Education",
  "Automotive",
  "Other",
];

// GET /api/business/browse - Browse all active listings
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const search = searchParams.get("search");
  const saved = searchParams.get("saved") === "true";
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Get user's saved listings for the "isSaved" flag
  const userSavedIds = await prisma.savedBusiness.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  });
  const savedIdSet = new Set(userSavedIds.map((s) => s.listingId));

  if (saved) {
    // Return only saved businesses
    const savedListings = await prisma.businessListing.findMany({
      where: {
        id: { in: Array.from(savedIdSet) },
        isActive: true,
      },
      include: {
        _count: {
          select: { recommendations: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const listings = savedListings.map((l) => ({
      ...l,
      isSaved: true,
      recommendationCount: l._count.recommendations,
    }));

    return NextResponse.json({ listings, categories: CATEGORIES });
  }

  // Build where clause
  const where: Record<string, unknown> = { isActive: true };
  if (category && category !== "all") {
    where.category = category;
  }
  if (location) {
    where.location = { contains: location };
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.businessListing.findMany({
      where,
      include: {
        _count: {
          select: { recommendations: true },
        },
      },
      orderBy: [
        { tier: "desc" }, // Premium first
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
    }),
    prisma.businessListing.count({ where }),
  ]);

  const enrichedListings = listings.map((l) => ({
    ...l,
    isSaved: savedIdSet.has(l.id),
    recommendationCount: l._count.recommendations,
  }));

  return NextResponse.json({
    listings: enrichedListings,
    total,
    categories: CATEGORIES,
    hasMore: offset + limit < total,
  });
}
