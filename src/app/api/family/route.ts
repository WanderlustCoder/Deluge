import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFamily, createFamily } from "@/lib/family";
import { logError } from "@/lib/logger";

/**
 * GET /api/family
 * Get the current user's family
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await getUserFamily(session.user.id);

    return NextResponse.json({ family });
  } catch (error) {
    logError("api/family", error);
    return NextResponse.json(
      { error: "Failed to get family" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/family
 * Create a new family
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body as { name: string };

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Family name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const result = await createFamily(session.user.id, name);

    return NextResponse.json({ success: true, familyId: result.familyId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create family";
    logError("api/family", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
