import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      accountType: true,
      archivedAt: true,
      createdAt: true,
      lastLoginAt: true,
      creditTier: true,
      creditLimit: true,
      watershed: {
        select: {
          balance: true,
          totalInflow: true,
          totalOutflow: true,
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              type: true,
              amount: true,
              description: true,
              balanceAfter: true,
              createdAt: true,
            },
          },
        },
      },
      badges: {
        select: {
          earnedAt: true,
          badge: { select: { name: true, icon: true, tier: true } },
        },
      },
      borrowerLoans: {
        select: { id: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      referrals: {
        select: { id: true, status: true, activatedAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [adViewCount, contributionCount, allocationCount, adStats] =
    await Promise.all([
      prisma.adView.count({ where: { userId: id } }),
      prisma.contribution.count({ where: { userId: id } }),
      prisma.allocation.count({ where: { userId: id } }),
      prisma.adView.aggregate({
        where: { userId: id },
        _sum: { grossRevenue: true, watershedCredit: true },
      }),
    ]);

  return NextResponse.json({
    ...user,
    counts: {
      adViews: adViewCount,
      contributions: contributionCount,
      allocations: allocationCount,
    },
    adStats: {
      totalGrossRevenue: adStats._sum.grossRevenue ?? 0,
      totalWatershedCredit: adStats._sum.watershedCredit ?? 0,
    },
  });
}
