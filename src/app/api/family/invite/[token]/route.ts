import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { acceptFamilyInvite } from "@/lib/family";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

/**
 * GET /api/family/invite/[token]
 * Get invite details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await prisma.familyInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Get family name
    const family = await prisma.family.findUnique({
      where: { id: invite.familyId },
      select: { name: true },
    });

    return NextResponse.json({
      invite: {
        email: invite.email,
        role: invite.role,
        familyName: family?.name,
        status: invite.status,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    logError("api/family/invite/[token]", error);
    return NextResponse.json(
      { error: "Failed to get invite" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/family/invite/[token]
 * Accept an invite
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    const result = await acceptFamilyInvite(token, session.user.id);

    return NextResponse.json({
      success: true,
      familyId: result.familyId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept invite";
    logError("api/family/invite/[token]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
