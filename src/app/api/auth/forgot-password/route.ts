import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendEmail, resetPasswordEmailHtml } from "@/lib/email";
import { logError, logInfo } from "@/lib/logger";
import { setResetToken, cleanupExpiredTokens } from "@/lib/reset-tokens";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      // Always return success to avoid leaking whether email exists
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      // Generate a reset token
      const rawToken = generateToken();
      const hashedToken = hashToken(rawToken);

      // Store hashed token with 1-hour expiry
      setResetToken(hashedToken, {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // Clean up expired tokens periodically
      cleanupExpiredTokens();

      // Build reset URL using the raw (unhashed) token
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

      // Send reset email
      await sendEmail({
        to: user.email,
        subject: "Reset your Deluge password",
        html: resetPasswordEmailHtml(user.name, resetUrl),
      });

      logInfo("forgot-password", "Password reset email sent", {
        userId: user.id,
      });
    }

    // Always return success (don't leak whether email exists)
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/auth/forgot-password", error, {
      route: "POST /api/auth/forgot-password",
    });
    // Still return success to avoid leaking info on errors
    return NextResponse.json({ success: true });
  }
}
