import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/business/[id]/save - Toggle save status
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

  // Check if already saved
  const existing = await prisma.savedBusiness.findUnique({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: id,
      },
    },
  });

  if (existing) {
    // Unsave
    await prisma.savedBusiness.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ saved: false });
  }

  // Save
  await prisma.savedBusiness.create({
    data: {
      userId: session.user.id,
      listingId: id,
    },
  });

  return NextResponse.json({ saved: true });
}
