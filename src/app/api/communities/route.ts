import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { createCommunitySchema } from "@/lib/validation";
import { COMMUNITY_LEVEL_HIERARCHY, CommunityLevel } from "@/lib/constants";

// Helper to create URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET: list communities
// Query params:
//   - type: "geographic" | "interest" | "all" (default: all)
//   - level: filter by hierarchy level
//   - parentId: filter by parent community
//   - joined: "true" to show only communities user has joined
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const level = searchParams.get("level");
  const parentId = searchParams.get("parentId");
  const joined = searchParams.get("joined");

  // Build where clause
  const where: Prisma.CommunityWhereInput = {};

  if (type && type !== "all") {
    where.type = type;
  }

  if (level) {
    where.level = level;
  }

  if (parentId === "null") {
    where.parentId = null;
  } else if (parentId) {
    where.parentId = parentId;
  }

  // Filter to only joined communities
  if (joined === "true") {
    where.members = {
      some: {
        userId: session.user.id,
      },
    };
  }

  const communities = await prisma.community.findMany({
    where,
    include: {
      creator: { select: { name: true } },
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { projects: true, children: true } },
      // Include membership status for current user
      members: {
        where: { userId: session.user.id },
        select: { role: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform to include isMember flag
  const communitiesWithMembership = communities.map((c) => ({
    ...c,
    isMember: c.members.length > 0,
    memberRole: c.members[0]?.role || null,
    members: undefined, // Remove the members array from response
  }));

  return NextResponse.json(communitiesWithMembership);
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

    const data = parsed.data;

    // Validate hierarchy rules for geographic communities
    if (data.type === "geographic") {
      // Level is required for geographic communities
      if (!data.level) {
        return NextResponse.json(
          { error: "Level is required for geographic communities" },
          { status: 400 }
        );
      }

      // If not a country, parentId is required
      if (data.level !== "country" && !data.parentId) {
        return NextResponse.json(
          { error: "Parent community is required for non-country levels" },
          { status: 400 }
        );
      }

      // Validate parent exists and hierarchy is correct
      if (data.parentId) {
        const parent = await prisma.community.findUnique({
          where: { id: data.parentId },
          select: { level: true, slug: true },
        });

        if (!parent) {
          return NextResponse.json(
            { error: "Parent community not found" },
            { status: 400 }
          );
        }

        // Check that parent is one level above
        const expectedChildLevel = COMMUNITY_LEVEL_HIERARCHY[parent.level as CommunityLevel];
        if (expectedChildLevel !== data.level) {
          return NextResponse.json(
            { error: `Cannot create ${data.level} under ${parent.level}. Expected: ${expectedChildLevel}` },
            { status: 400 }
          );
        }
      }
    }

    // Generate slug for geographic communities
    let slug: string | undefined;
    if (data.type === "geographic" && data.level) {
      if (data.parentId) {
        const parent = await prisma.community.findUnique({
          where: { id: data.parentId },
          select: { slug: true },
        });
        slug = `${parent?.slug}/${slugify(data.name)}`;
      } else {
        // Root level (country)
        slug = slugify(data.name);
      }

      // Check slug uniqueness
      const existing = await prisma.community.findFirst({
        where: { slug },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A community with this name already exists at this level" },
          { status: 400 }
        );
      }
    }

    const community = await prisma.community.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        category: data.category,
        type: data.type,
        parentId: data.parentId,
        level: data.level,
        latitude: data.latitude,
        longitude: data.longitude,
        slug,
        createdBy: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
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
