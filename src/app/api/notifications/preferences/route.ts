import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { notificationPreferencesSchema } from "@/lib/validation";

// GET: get user's notification preferences
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let preferences = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await prisma.notificationPreference.create({
      data: {
        userId: session.user.id,
      },
    });
  }

  return NextResponse.json(preferences);
}

// PATCH: update notification preferences
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = notificationPreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Upsert preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...parsed.data,
      },
      create: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    logError("api/notifications/preferences", error, {
      userId: session.user.id,
      route: "PATCH /api/notifications/preferences",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
