import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const onboardingSchema = z.object({
  interests: z.array(z.string()).optional(),
  pathway: z.string().optional(),
  complete: z.boolean().optional(),
});

// POST /api/account/onboarding - Save onboarding progress
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { interests, complete } = onboardingSchema.parse(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        interests: interests?.length ? interests.join(",") : undefined,
        onboardingComplete: complete ?? false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error saving onboarding:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding" },
      { status: 500 }
    );
  }
}

// GET /api/account/onboarding - Check onboarding status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingComplete: true,
      interests: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    complete: user.onboardingComplete,
    interests: user.interests?.split(",").filter(Boolean) || [],
  });
}
