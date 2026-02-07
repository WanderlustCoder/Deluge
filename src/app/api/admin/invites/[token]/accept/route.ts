import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.adminInvite.findUnique({ where: { token } });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 400 });
  }

  if (invite.expiresAt < new Date()) {
    await prisma.adminInvite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
  }

  const body = await request.json();
  const { name, password } = body;

  if (!name?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Name and password (min 6 chars) required" },
      { status: 400 }
    );
  }

  // Check if user already exists with this email
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: invite.email,
      passwordHash,
      accountType: "admin",
      watershed: { create: {} },
    },
  });

  await prisma.adminInvite.update({
    where: { id: invite.id },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  logAudit({
    adminId: user.id,
    adminEmail: user.email,
    action: "admin_invite_accepted",
    targetType: "admin_invite",
    targetId: invite.id,
    details: JSON.stringify({ invitedBy: invite.invitedBy }),
  });

  return NextResponse.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.adminInvite.findUnique({ where: { token } });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 400 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
  }

  return NextResponse.json({
    email: invite.email,
    expiresAt: invite.expiresAt,
  });
}
