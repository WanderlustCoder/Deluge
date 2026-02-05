import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LeaderboardType =
  | "ads_month"
  | "ads_all"
  | "projects_month"
  | "projects_all"
  | "streaks"
  | "referrals";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  value: number;
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "ads_all") as LeaderboardType;

  const validTypes: LeaderboardType[] = [
    "ads_month",
    "ads_all",
    "projects_month",
    "projects_all",
    "streaks",
    "referrals",
  ];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  let entries: LeaderboardEntry[] = [];
  const monthStart = startOfMonth();

  switch (type) {
    case "ads_month": {
      const results = await prisma.adView.groupBy({
        by: ["userId"],
        _count: { id: true },
        where: { createdAt: { gte: monthStart } },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      });
      const userIds = results.map((r) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
      entries = results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: userMap[r.userId] || "Unknown",
        value: r._count.id,
      }));
      break;
    }

    case "ads_all": {
      const results = await prisma.adView.groupBy({
        by: ["userId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      });
      const userIds = results.map((r) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
      entries = results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: userMap[r.userId] || "Unknown",
        value: r._count.id,
      }));
      break;
    }

    case "projects_month": {
      const results = await prisma.allocation.groupBy({
        by: ["userId"],
        _sum: { amount: true },
        where: { createdAt: { gte: monthStart } },
        orderBy: { _sum: { amount: "desc" } },
        take: 20,
      });
      const userIds = results.map((r) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
      entries = results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: userMap[r.userId] || "Unknown",
        value: Math.round((r._sum.amount || 0) * 100) / 100,
      }));
      break;
    }

    case "projects_all": {
      const results = await prisma.allocation.groupBy({
        by: ["userId"],
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 20,
      });
      const userIds = results.map((r) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
      entries = results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: userMap[r.userId] || "Unknown",
        value: Math.round((r._sum.amount || 0) * 100) / 100,
      }));
      break;
    }

    case "streaks": {
      const results = await prisma.streak.findMany({
        where: { type: "ad_watch" },
        orderBy: { longestDays: "desc" },
        take: 20,
        include: { user: { select: { id: true, name: true } } },
      });
      entries = results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.user.name,
        value: r.longestDays,
      }));
      break;
    }

    case "referrals": {
      const results = await prisma.referral.groupBy({
        by: ["referrerId"],
        _count: { id: true },
        where: { status: { in: ["signed_up", "activated"] } },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      });
      const userIds = results.map((r) => r.referrerId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
      entries = results.map((r, i) => ({
        rank: i + 1,
        userId: r.referrerId,
        name: userMap[r.referrerId] || "Unknown",
        value: r._count.id,
      }));
      break;
    }
  }

  // Find current user's rank if not in top 20
  let currentUserRank: LeaderboardEntry | null = null;
  const inList = entries.find((e) => e.userId === session.user.id);
  if (inList) {
    currentUserRank = inList;
  } else {
    // Calculate current user's value for this category
    let userValue = 0;
    switch (type) {
      case "ads_month": {
        userValue = await prisma.adView.count({
          where: { userId: session.user.id, createdAt: { gte: monthStart } },
        });
        break;
      }
      case "ads_all": {
        userValue = await prisma.adView.count({
          where: { userId: session.user.id },
        });
        break;
      }
      case "projects_month": {
        const agg = await prisma.allocation.aggregate({
          _sum: { amount: true },
          where: { userId: session.user.id, createdAt: { gte: monthStart } },
        });
        userValue = Math.round((agg._sum.amount || 0) * 100) / 100;
        break;
      }
      case "projects_all": {
        const agg = await prisma.allocation.aggregate({
          _sum: { amount: true },
          where: { userId: session.user.id },
        });
        userValue = Math.round((agg._sum.amount || 0) * 100) / 100;
        break;
      }
      case "streaks": {
        const streak = await prisma.streak.findUnique({
          where: { userId_type: { userId: session.user.id, type: "ad_watch" } },
        });
        userValue = streak?.longestDays || 0;
        break;
      }
      case "referrals": {
        userValue = await prisma.referral.count({
          where: {
            referrerId: session.user.id,
            status: { in: ["signed_up", "activated"] },
          },
        });
        break;
      }
    }

    if (userValue > 0) {
      // Approximate rank
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      currentUserRank = {
        rank: entries.length + 1,
        userId: session.user.id,
        name: user?.name || "You",
        value: userValue,
      };
    }
  }

  return NextResponse.json({ entries, currentUserRank });
}
