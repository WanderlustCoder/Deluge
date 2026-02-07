import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs = await prisma.roleConfig.findMany({
    orderBy: { role: "asc" },
  });

  // Get active user counts per role
  const roleCounts = await prisma.userRole.groupBy({
    by: ["role"],
    where: { isActive: true },
    _count: { id: true },
  });

  const countMap = Object.fromEntries(
    roleCounts.map((r) => [r.role, r._count.id])
  );

  const result = configs.map((c) => ({
    ...c,
    activeUsers: countMap[c.role] ?? 0,
    thresholds: JSON.parse(c.thresholds),
  }));

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { role, thresholds, isAutomatic } = body;

  if (!role || typeof role !== "string") {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  const config = await prisma.roleConfig.findUnique({
    where: { role },
  });

  if (!config) {
    return NextResponse.json({ error: "Role config not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (thresholds !== undefined) {
    updateData.thresholds = JSON.stringify(thresholds);
  }
  if (isAutomatic !== undefined) {
    updateData.isAutomatic = isAutomatic;
  }

  const updated = await prisma.roleConfig.update({
    where: { role },
    data: updateData,
  });

  logAudit({
    adminId: session.user.id,
    adminEmail: session.user.email!,
    action: "role_config_update",
    targetType: "role_config",
    targetId: config.id,
    details: JSON.stringify({ role, changes: updateData }),
  });

  return NextResponse.json({
    ...updated,
    thresholds: JSON.parse(updated.thresholds),
  });
}
