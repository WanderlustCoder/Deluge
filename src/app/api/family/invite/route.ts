import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFamily, inviteFamilyMember } from "@/lib/family";
import { logError } from "@/lib/logger";

/**
 * POST /api/family/invite
 * Invite a new family member
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role } = body as { email: string; role: string };

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    if (!["admin", "adult", "child"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Get user's family
    const family = await getUserFamily(session.user.id);
    if (!family) {
      return NextResponse.json(
        { error: "You don't have a family yet" },
        { status: 400 }
      );
    }

    // Check user is admin
    if (family.currentMember.role !== "admin") {
      return NextResponse.json(
        { error: "Only family admins can send invites" },
        { status: 403 }
      );
    }

    const result = await inviteFamilyMember(
      family.id,
      email,
      role as "admin" | "adult" | "child"
    );

    // TODO: Send email with invite link

    return NextResponse.json({
      success: true,
      token: result.token,
      // In production, don't return token - send via email
      inviteUrl: `${process.env.NEXTAUTH_URL}/family/join?token=${result.token}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send invite";
    logError("api/family/invite", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
