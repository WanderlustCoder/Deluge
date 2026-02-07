import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Check if email already has a pending invite
  const existing = await prisma.adminInvite.findUnique({ where: { email } });
  if (existing && existing.status === "pending" && existing.expiresAt > new Date()) {
    return NextResponse.json(
      { error: "An active invite already exists for this email" },
      { status: 409 }
    );
  }

  // Only allow @deluge.fund emails for admin accounts
  if (!email.endsWith("@deluge.fund")) {
    return NextResponse.json(
      { error: "Admin accounts must use a @deluge.fund email" },
      { status: 400 }
    );
  }

  // Check if email is already an admin
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.accountType === "admin") {
    return NextResponse.json(
      { error: "This email is already an admin" },
      { status: 409 }
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Upsert: replace expired/accepted invite if exists
  const invite = existing
    ? await prisma.adminInvite.update({
        where: { email },
        data: { token, status: "pending", expiresAt, invitedBy: session.user.id, acceptedAt: null },
      })
    : await prisma.adminInvite.create({
        data: { email, token, invitedBy: session.user.id, expiresAt },
      });

  logAudit({
    adminId: session.user.id,
    adminEmail: session.user.email!,
    action: "admin_invite_created",
    targetType: "admin_invite",
    targetId: invite.id,
    details: JSON.stringify({ invitedEmail: email }),
  });

  return NextResponse.json({
    success: true,
    data: {
      id: invite.id,
      email: invite.email,
      token: invite.token,
      expiresAt: invite.expiresAt,
    },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(invites);
}
