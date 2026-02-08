import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unsubscribeUser } from "@/lib/push-notifications";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body as { endpoint?: string };

    await unsubscribeUser(session.user.id, endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/push/unsubscribe", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
