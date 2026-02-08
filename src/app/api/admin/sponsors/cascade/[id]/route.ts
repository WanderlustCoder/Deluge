import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSponsorStatus } from "@/lib/cascade-sponsors";
import { logError } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const sponsor = await prisma.cascadeSponsor.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { cascades: true } },
      },
    });

    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    return NextResponse.json({ sponsor });
  } catch (error) {
    logError("api/admin/sponsors/cascade/[id]", error);
    return NextResponse.json(
      { error: "Failed to get sponsor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      status,
      logoUrl,
      message,
      linkUrl,
      categories,
      locations,
      budgetTotal,
      endDate,
    } = body as {
      status?: "active" | "paused" | "exhausted" | "expired";
      logoUrl?: string;
      message?: string;
      linkUrl?: string;
      categories?: string[];
      locations?: string[];
      budgetTotal?: number;
      endDate?: string;
    };

    // Update status via helper if provided
    if (status) {
      await updateSponsorStatus(id, status);
    }

    // Update other fields
    const updateData: Record<string, unknown> = {};
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (message !== undefined) updateData.message = message;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (categories !== undefined)
      updateData.categories = JSON.stringify(categories);
    if (locations !== undefined)
      updateData.locations = JSON.stringify(locations);
    if (budgetTotal !== undefined) updateData.budgetTotal = budgetTotal;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;

    if (Object.keys(updateData).length > 0) {
      await prisma.cascadeSponsor.update({
        where: { id },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/admin/sponsors/cascade/[id]", error);
    return NextResponse.json(
      { error: "Failed to update sponsor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.cascadeSponsor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/admin/sponsors/cascade/[id]", error);
    return NextResponse.json(
      { error: "Failed to delete sponsor" },
      { status: 500 }
    );
  }
}
