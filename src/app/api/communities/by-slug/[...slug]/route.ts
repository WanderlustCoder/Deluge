import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch community by slug path
// Example: /api/communities/by-slug/usa/idaho/ada-county/boise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const slugPath = slug.join("/");

  const community = await prisma.community.findFirst({
    where: { slug: slugPath },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          level: true,
          latitude: true,
          longitude: true,
          memberCount: true,
          _count: {
            select: {
              children: true,
              projects: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
      creator: {
        select: { name: true },
      },
      _count: {
        select: {
          members: true,
          projects: true,
        },
      },
    },
  });

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  // Build breadcrumb path
  const breadcrumbs: Array<{ id: string; name: string; slug: string; level: string | null }> = [];
  let current = community.parent;

  while (current) {
    breadcrumbs.unshift({
      id: current.id,
      name: current.name,
      slug: current.slug || "",
      level: current.level,
    });

    // Fetch next parent
    const parentCommunity = await prisma.community.findUnique({
      where: { id: current.id },
      select: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            level: true,
          },
        },
      },
    });
    current = parentCommunity?.parent || null;
  }

  return NextResponse.json({
    ...community,
    breadcrumbs,
  });
}
