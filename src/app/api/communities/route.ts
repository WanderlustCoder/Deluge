import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { createCommunitySchema } from "@/lib/validation";

// GET: list communities
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const communities = await prisma.community.findMany({
    include: {
      creator: { select: { name: true } },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(communities);
}

// POST: create community
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createCommunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: {
        ...parsed.data,
        createdBy: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: community });
  } catch (error) {
    logError("api/communities", error, { userId: session.user.id, route: "POST /api/communities" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
