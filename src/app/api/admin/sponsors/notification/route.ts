import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createNotificationSponsor,
  listNotificationSponsors,
} from "@/lib/notification-sponsors";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.accountType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const businessId = searchParams.get("businessId") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const sponsors = await listNotificationSponsors({ status, businessId, limit });

    return NextResponse.json({ sponsors });
  } catch (error) {
    logError("api/admin/sponsors/notification", error);
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
      businessId,
      message,
      linkUrl,
      latitude,
      longitude,
      radiusMeters,
      notificationTypes,
      budgetTotal,
      costPerNotification,
    } = body as {
      businessId: string;
      message: string;
      linkUrl?: string;
      latitude: number;
      longitude: number;
      radiusMeters?: number;
      notificationTypes: string[];
      budgetTotal: number;
      costPerNotification?: number;
    };

    // Validation
    if (!businessId || !message || !latitude || !longitude || !budgetTotal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!notificationTypes || notificationTypes.length === 0) {
      return NextResponse.json(
        { error: "At least one notification type is required" },
        { status: 400 }
      );
    }

    const result = await createNotificationSponsor({
      businessId,
      message,
      linkUrl,
      latitude,
      longitude,
      radiusMeters,
      notificationTypes,
      budgetTotal,
      costPerNotification,
    });

    return NextResponse.json({ success: true, sponsorId: result.id });
  } catch (error) {
    logError("api/admin/sponsors/notification", error);
    return NextResponse.json(
      { error: "Failed to create sponsor" },
      { status: 500 }
    );
  }
}
