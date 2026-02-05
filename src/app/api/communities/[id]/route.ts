import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
      projects: {
        include: { project: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(community);
}
