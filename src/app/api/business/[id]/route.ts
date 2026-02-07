import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  category: z.string().min(1).optional(),
  description: z.string().max(300).optional(),
  location: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/business/[id] - Get listing details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.businessListing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      recommendations: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { views: true, saves: true, recommendations: true },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Check if user has saved this listing
  const userSave = await prisma.savedBusiness.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: id,
      },
    },
  });

  // Check if user has already recommended
  const userRecommendation = await prisma.businessRecommendation.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: id,
      },
    },
  });

  return NextResponse.json({
    ...listing,
    isSaved: !!userSave,
    hasRecommended: !!userRecommendation,
    isOwner: listing.ownerId === session.user.id,
  });
}

// PUT /api/business/[id] - Update listing (owner only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.businessListing.findUnique({
    where: { id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.businessListing.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE /api/business/[id] - Delete listing (owner only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.businessListing.findUnique({
    where: { id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.businessListing.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
