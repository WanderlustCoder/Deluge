import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: get public profile data
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      profileVisibility: true,
      createdAt: true,
      badges: {
        include: {
          badge: true,
        },
        orderBy: { earnedAt: "desc" },
      },
      _count: {
        select: {
          allocations: true,
          fundedShares: true,
          contributions: true,
          communities: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check visibility
  const isOwnProfile = session.user.id === id;
  const visibility = user.profileVisibility;

  if (!isOwnProfile) {
    if (visibility === "private") {
      return NextResponse.json(
        { error: "This profile is private" },
        { status: 403 }
      );
    }

    if (visibility === "community") {
      // Check if viewer shares a community with this user
      const sharedCommunity = await prisma.communityMember.findFirst({
        where: {
          userId: session.user.id,
          community: {
            members: {
              some: { userId: id },
            },
          },
        },
      });

      if (!sharedCommunity) {
        return NextResponse.json(
          { error: "You must share a community to view this profile" },
          { status: 403 }
        );
      }
    }
  }

  // Calculate stats
  const [totalFunded, projectsBacked, loansFunded] = await Promise.all([
    prisma.allocation.aggregate({
      where: { userId: id },
      _sum: { amount: true },
    }),
    prisma.allocation
      .groupBy({
        by: ["projectId"],
        where: { userId: id },
      })
      .then((r) => r.length),
    prisma.loanShare.aggregate({
      where: { funderId: id },
      _count: true,
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    profileVisibility: isOwnProfile ? user.profileVisibility : undefined,
    memberSince: user.createdAt,
    badges: user.badges.map((ub) => ({
      id: ub.badge.id,
      key: ub.badge.key,
      name: ub.badge.name,
      icon: ub.badge.icon,
      tier: ub.badge.tier,
      earnedAt: ub.earnedAt,
    })),
    stats: {
      totalFunded: totalFunded._sum.amount || 0,
      projectsBacked,
      loansFunded: loansFunded._count,
      loansAmount: loansFunded._sum.amount || 0,
      communitiesJoined: user._count.communities,
    },
    isOwnProfile,
  });
}
