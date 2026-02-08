import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { subscribeUser, type PushSubscriptionData } from "@/lib/push-notifications";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body as { subscription: PushSubscriptionData };

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Add user agent from headers
    const userAgent = request.headers.get("user-agent") || undefined;
    subscription.userAgent = userAgent;

    const result = await subscribeUser(session.user.id, subscription);

    return NextResponse.json({
      success: true,
      subscriptionId: result.id,
    });
  } catch (error) {
    logError("api/push/subscribe", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
