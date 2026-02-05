import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingComplete: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("api/onboarding/complete", error, {
      userId: session.user.id,
      route: "POST /api/onboarding/complete",
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
