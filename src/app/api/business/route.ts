import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const listingSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(1),
  description: z.string().max(300), // ~50 words
  location: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// GET /api/business - Get user's own listings (for owners)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";

  if (mine) {
    // Owner's listings
    const listings = await prisma.businessListing.findMany({
      where: { ownerId: session.user.id },
      include: {
        _count: {
          select: { views: true, saves: true, recommendations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  }

  return NextResponse.json({ error: "Use /api/business/browse" }, { status: 400 });
}

// POST /api/business - Create a new listing
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = listingSchema.parse(body);

    const listing = await prisma.businessListing.create({
      data: {
        ownerId: session.user.id,
        name: data.name,
        category: data.category,
        description: data.description,
        location: data.location,
        address: data.address,
        phone: data.phone,
        website: data.website,
        imageUrl: data.imageUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        tier: "basic",
        isActive: true,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
