import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createCascadeSponsor,
  listCascadeSponsors,
  type CascadeSponsorTier,
} from "@/lib/cascade-sponsors";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const tier = searchParams.get("tier") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const sponsors = await listCascadeSponsors({ status, tier, limit });

    return NextResponse.json({ sponsors });
  } catch (error) {
    logError("api/admin/sponsors/cascade", error);
    return NextResponse.json(
      { error: "Failed to list sponsors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      sponsorType,
      businessId,
      campaignId,
      corporateName,
      tier,
      logoUrl,
      message,
      linkUrl,
      categories,
      locations,
      budgetTotal,
      startDate,
      endDate,
    } = body as {
      sponsorType: "business" | "corporate" | "matching_campaign";
      businessId?: string;
      campaignId?: string;
      corporateName?: string;
      tier: CascadeSponsorTier;
      logoUrl?: string;
      message?: string;
      linkUrl?: string;
      categories?: string[];
      locations?: string[];
      budgetTotal: number;
      startDate: string;
      endDate?: string;
    };

    // Validation
    if (!sponsorType || !tier || !budgetTotal || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["basic", "featured", "premium"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    if (sponsorType === "business" && !businessId) {
      return NextResponse.json(
        { error: "Business ID required for business sponsor" },
        { status: 400 }
      );
    }

    if (sponsorType === "matching_campaign" && !campaignId) {
      return NextResponse.json(
        { error: "Campaign ID required for matching campaign sponsor" },
        { status: 400 }
      );
    }

    if (sponsorType === "corporate" && !corporateName) {
      return NextResponse.json(
        { error: "Corporate name required for corporate sponsor" },
        { status: 400 }
      );
    }

    const result = await createCascadeSponsor({
      sponsorType,
      businessId,
      campaignId,
      corporateName,
      tier,
      logoUrl,
      message,
      linkUrl,
      categories,
      locations,
      budgetTotal,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({ success: true, sponsorId: result.id });
  } catch (error) {
    logError("api/admin/sponsors/cascade", error);
    return NextResponse.json(
      { error: "Failed to create sponsor" },
      { status: 500 }
    );
  }
}
