import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Prevent archiving yourself
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot archive your own account" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, accountType: true, archivedAt: true, email: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent archiving other admins
  if (target.accountType === "admin") {
    return NextResponse.json(
      { error: "Cannot archive admin accounts" },
      { status: 400 }
    );
  }

  const isArchived = target.archivedAt !== null;
  const newArchivedAt = isArchived ? null : new Date();

  await prisma.user.update({
    where: { id },
    data: { archivedAt: newArchivedAt },
  });

  logAudit({
    adminId: session.user.id!,
    adminEmail: session.user.email!,
    action: isArchived ? "user_restored" : "user_archived",
    targetType: "user",
    targetId: id,
    details: `${isArchived ? "Restored" : "Archived"} user ${target.email}`,
  });

  return NextResponse.json({
    archived: !isArchived,
    archivedAt: newArchivedAt?.toISOString() ?? null,
  });
}
