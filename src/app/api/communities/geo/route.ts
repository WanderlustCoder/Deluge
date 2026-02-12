import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch communities with geographic data for map rendering
// Query params:
//   - level: filter by level (state, county, city, etc.)
//   - parentId: filter by parent community
//   - bounds: filter by map bounds "minLat,minLng,maxLat,maxLng"
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const parentId = searchParams.get("parentId");
  const boundsParam = searchParams.get("bounds");

  // Build where clause
  const where: Prisma.CommunityWhereInput = {
    type: "geographic",
    OR: [
      { latitude: { not: null } },
      { bounds: { not: null } },
    ],
  };

  if (level) {
    where.level = level;
  }

  if (parentId) {
    where.parentId = parentId;
  }

  // Parse bounds if provided (minLat,minLng,maxLat,maxLng)
  if (boundsParam) {
    const [minLat, minLng, maxLat, maxLng] = boundsParam.split(",").map(Number);
    if (!isNaN(minLat) && !isNaN(minLng) && !isNaN(maxLat) && !isNaN(maxLng)) {
      where.AND = [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLng, lte: maxLng } },
      ];
    }
  }

  const communities = await prisma.community.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      level: true,
      latitude: true,
      longitude: true,
      bounds: true,
      memberCount: true,
      parentId: true,
      _count: {
        select: {
          children: true,
          projects: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Transform to GeoJSON-compatible format
  const features = communities.map((c) => {
    // If community has bounds (polygon), parse it
    if (c.bounds) {
      try {
        const geometry = JSON.parse(c.bounds);
        return {
          type: "Feature",
          id: c.id,
          properties: {
            id: c.id,
            name: c.name,
            slug: c.slug,
            level: c.level,
            memberCount: c.memberCount,
            childCount: c._count.children,
            projectCount: c._count.projects,
          },
          geometry,
        };
      } catch {
        // Fall through to point
      }
    }

    // Default to point geometry
    return {
      type: "Feature",
      id: c.id,
      properties: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        level: c.level,
        memberCount: c.memberCount,
        childCount: c._count.children,
        projectCount: c._count.projects,
      },
      geometry: {
        type: "Point",
        coordinates: [c.longitude, c.latitude],
      },
    };
  });

  return NextResponse.json({
    type: "FeatureCollection",
    features,
  });
}
