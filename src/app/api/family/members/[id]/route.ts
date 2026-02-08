import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFamilyMember, updateMemberSettings, getUserFamily } from "@/lib/family";
import { logError } from "@/lib/logger";

/**
 * PUT /api/family/members/[id]
 * Update member settings
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await updateMemberSettings(id, body, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update member";
    logError("api/family/members/[id]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/family/members/[id]
 * Remove a member from the family
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get user's family
    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json(
        { error: "You don't have a family" },
        { status: 400 }
      );
    }

    await removeFamilyMember(family.id, id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove member";
    logError("api/family/members/[id]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
