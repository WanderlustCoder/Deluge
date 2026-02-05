import { prisma } from "@/lib/prisma";

export async function getActivityChartData(userId: string) {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [adViews, allocations] = await Promise.all([
    prisma.adView.findMany({
      where: { userId, createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.allocation.findMany({
      where: { userId, createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, amount: true },
    }),
  ]);

  // Group by day for last 14 days
  const days: { date: string; ads: number; funded: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayAds = adViews.filter(
      (a) => a.createdAt.toISOString().split("T")[0] === dateStr
    ).length;
    const dayFunded = allocations
      .filter((a) => a.createdAt.toISOString().split("T")[0] === dateStr)
      .reduce((s, a) => s + a.amount, 0);
    days.push({
      date: dateStr,
      ads: dayAds,
      funded: Math.round(dayFunded * 100) / 100,
    });
  }
  return days;
}

export async function getActiveProjects(userId: string) {
  const allocations = await prisma.allocation.findMany({
    where: { userId },
    select: { projectId: true },
    distinct: ["projectId"],
    take: 6,
  });

  const projectIds = allocations.map((a) => a.projectId);
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds }, status: "active" },
    take: 4,
  });
  return projects;
}

export async function getActivityFeedItems(userId: string) {
  const [adViews, allocations, badges] = await Promise.all([
    prisma.adView.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, watershedCredit: true, createdAt: true },
    }),
    prisma.allocation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { project: { select: { title: true } } },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      take: 3,
      include: { badge: { select: { name: true, icon: true } } },
    }),
  ]);

  type FeedItem = {
    id: string;
    type: string;
    description: string;
    time: Date;
  };
  const items: FeedItem[] = [];

  adViews.forEach((a) =>
    items.push({
      id: a.id,
      type: "ad",
      description: `Watched an ad (+$${a.watershedCredit.toFixed(3)})`,
      time: a.createdAt,
    })
  );
  allocations.forEach((a) =>
    items.push({
      id: a.id,
      type: "fund",
      description: `Funded "${a.project.title}"`,
      time: a.createdAt,
    })
  );
  badges.forEach((b) =>
    items.push({
      id: b.id,
      type: "badge",
      description: `Earned "${b.badge.name}" badge`,
      time: b.earnedAt,
    })
  );

  return items
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 8);
}
