import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { logError, logInfo } from "@/lib/logger";
import { resetTokens } from "../forgot-password/route";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Hash the provided token to look it up in the store
    const hashedToken = hashToken(token);
    const stored = resetTokens.get(hashedToken);

    if (!stored) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (stored.expiresAt < new Date()) {
      resetTokens.delete(hashedToken);
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password and update the user
    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    });

    // Remove the used token
    resetTokens.delete(hashedToken);

    logInfo("reset-password", "Password reset successfully", {
      userId: stored.userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/auth/reset-password", error, {
      route: "POST /api/auth/reset-password",
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
