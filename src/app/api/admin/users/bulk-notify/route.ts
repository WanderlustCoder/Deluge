import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { bulkNotifySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bulkNotifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { userIds, title, message, type } = parsed.data;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
    })),
  });

  logAudit({
    adminId: session.user.id,
    adminEmail: session.user.email!,
    action: "bulk_notify",
    targetType: "user",
    details: JSON.stringify({
      userIds,
      title,
      type,
      sent: userIds.length,
    }),
  });

  return NextResponse.json({ sent: userIds.length });
}
