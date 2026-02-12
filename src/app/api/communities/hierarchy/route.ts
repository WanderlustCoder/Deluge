import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch community hierarchy tree
// Query params:
//   - parentId: filter by parent (null for root)
//   - level: filter by level (country, state, county, city, district, neighborhood)
//   - includeStats: include member/project counts
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId");
  const level = searchParams.get("level");
  const includeStats = searchParams.get("includeStats") === "true";

  // Build where clause
  const where: Prisma.CommunityWhereInput = {
    type: "geographic",
  };

  if (parentId === "null" || parentId === "") {
    where.parentId = null;
  } else if (parentId) {
    where.parentId = parentId;
  }

  if (level) {
    where.level = level;
  }

  const communities = await prisma.community.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      level: true,
      latitude: true,
      longitude: true,
      bounds: true,
      parentId: true,
      memberCount: true,
      imageUrl: true,
      _count: includeStats
        ? {
            select: {
              children: true,
              projects: true,
            },
          }
        : undefined,
      // Include membership status for current user
      members: {
        where: { userId: session.user.id },
        select: { role: true },
        take: 1,
      },
      // Include parent info for city -> county relationship
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform to include isMember flag
  const communitiesWithMembership = communities.map((c) => ({
    ...c,
    isMember: c.members.length > 0,
    members: undefined,
  }));

  // If no specific parent requested, build tree structure starting from roots
  if (!parentId && !level) {
    const roots = communitiesWithMembership.filter((c) => !c.parentId);
    return NextResponse.json(roots);
  }

  return NextResponse.json(communitiesWithMembership);
}
