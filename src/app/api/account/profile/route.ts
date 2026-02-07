import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { profileUpdateSchema } from "@/lib/validation";

// GET: get own profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      profileVisibility: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH: update profile
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: parsed.data.bio !== undefined ? parsed.data.bio || null : undefined,
        avatarUrl:
          parsed.data.avatarUrl !== undefined
            ? parsed.data.avatarUrl || null
            : undefined,
        profileVisibility: parsed.data.profileVisibility,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        profileVisibility: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    logError("api/account/profile", error, {
      userId: session.user.id,
      route: "PATCH /api/account/profile",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
