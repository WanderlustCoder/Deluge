import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: join community
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.communityMember.create({
        data: {
          communityId: id,
          userId: session.user.id,
        },
      }),
      prisma.community.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE: leave community
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId: session.user.id },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member" },
        { status: 400 }
      );
    }

    // Can't leave if you're the only admin
    if (membership.role === "admin") {
      const adminCount = await prisma.communityMember.count({
        where: { communityId: id, role: "admin" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot leave — you are the only admin." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction([
      prisma.communityMember.delete({
        where: {
          communityId_userId: { communityId: id, userId: session.user.id },
        },
      }),
      prisma.community.update({
        where: { id },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
