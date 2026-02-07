import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const recommendSchema = z.object({
  note: z.string().min(10).max(500),
});

// POST /api/business/[id]/recommend - Leave a recommendation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listing = await prisma.businessListing.findUnique({
    where: { id, isActive: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Can't recommend own business
  if (listing.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot recommend your own business" },
      { status: 400 }
    );
  }

  // Check if already recommended
  const existing = await prisma.businessRecommendation.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already recommended this business" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { note } = recommendSchema.parse(body);

    const recommendation = await prisma.businessRecommendation.create({
      data: {
        userId: session.user.id,
        listingId: id,
        note,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to create recommendation" },
      { status: 500 }
    );
  }
}

// DELETE /api/business/[id]/recommend - Remove recommendation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recommendation = await prisma.businessRecommendation.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: id,
      },
    },
  });

  if (!recommendation) {
    return NextResponse.json(
      { error: "Recommendation not found" },
      { status: 404 }
    );
  }

  await prisma.businessRecommendation.delete({
    where: { id: recommendation.id },
  });

  return NextResponse.json({ success: true });
}
