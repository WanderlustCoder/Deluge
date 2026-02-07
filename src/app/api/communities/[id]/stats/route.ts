import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAggregatedStats,
  getCommunityStats,
} from "@/lib/community-hierarchy";

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
    select: {
      id: true,
      name: true,
      type: true,
      _count: { select: { children: true } },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Use aggregated stats if community has children (is a parent)
  const hasChildren = community._count.children > 0;
  const stats = hasChildren
    ? await getAggregatedStats(id)
    : await getCommunityStats(id);

  return NextResponse.json({
    ...stats,
    isAggregated: hasChildren,
    communityName: community.name,
  });
}
