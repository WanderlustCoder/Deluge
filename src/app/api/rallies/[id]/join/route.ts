import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinRally, checkRallyProgress, hasJoinedRally } from "@/lib/rallies";
import { logError } from "@/lib/logger";

// POST: Join a rally
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await joinRally(id, session.user.id);
    const progress = await checkRallyProgress(id);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    logError("api/rallies/join", error, {
      rallyId: id,
      userId: session.user.id,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET: Check if user has joined
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    let joined = false;
    if (session?.user?.id) {
      joined = await hasJoinedRally(id, session.user.id);
    }

    const progress = await checkRallyProgress(id);

    return NextResponse.json({
      joined,
      progress,
    });
  } catch (error) {
    logError("api/rallies/join", error, { rallyId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
