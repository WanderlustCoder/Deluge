import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { AdminResetButton } from "@/components/admin/reset-button";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { FlaggedItemsCard } from "@/components/admin/flagged-items";
import { SystemHealthCard } from "@/components/admin/system-health";
import { ReserveHealthCard } from "@/components/admin/reserve-health-card";
import { getRecentActivity } from "@/lib/activity";
import { getFlaggedItems } from "@/lib/admin-flags";
import { getReserveHealth } from "@/lib/reserve";
import {
  DollarSign,
  Droplets,
  Users,
  Tv,
  FolderOpen,
  Banknote,
  Users2,
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const currentPeriodStart = new Date(now - sevenDaysMs);
  const prevPeriodStart = new Date(now - 2 * sevenDaysMs);

  const [
    revenueAgg,
    totalAdViews,
    activeUsers7d,
    totalUsers,
    projectStats,
    loanCount,
    communityCount,
    // Trend data: current 7d vs previous 7d
    currentRevenue,
    prevRevenue,
    currentAdViews,
    prevAdViews,
    currentActiveUsers,
    prevActiveUsers,
    // Activity + flags + reserve
    recentActivity,
    flaggedItems,
    reserveHealth,
  ] = await Promise.all([
    prisma.adView.aggregate({
      _sum: { platformCut: true, watershedCredit: true },
    }),
    prisma.adView.count(),
    prisma.adView
      .findMany({
        where: { createdAt: { gte: currentPeriodStart } },
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((r) => r.length),
    prisma.user.count(),
    prisma.project.count(),
    prisma.loan.count(),
    prisma.community.count(),
    // Current 7d revenue
    prisma.adView.aggregate({
      where: { createdAt: { gte: currentPeriodStart } },
      _sum: { platformCut: true, watershedCredit: true },
    }),
    // Previous 7d revenue
    prisma.adView.aggregate({
      where: {
        createdAt: { gte: prevPeriodStart, lt: currentPeriodStart },
      },
      _sum: { platformCut: true, watershedCredit: true },
    }),
    // Current 7d ad views
    prisma.adView.count({
      where: { createdAt: { gte: currentPeriodStart } },
    }),
    // Previous 7d ad views
    prisma.adView.count({
      where: {
        createdAt: { gte: prevPeriodStart, lt: currentPeriodStart },
      },
    }),
    // Current 7d active users
    prisma.adView
      .findMany({
        where: { createdAt: { gte: currentPeriodStart } },
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((r) => r.length),
    // Previous 7d active users
    prisma.adView
      .findMany({
        where: {
          createdAt: { gte: prevPeriodStart, lt: currentPeriodStart },
        },
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((r) => r.length),
    getRecentActivity(20),
    getFlaggedItems(),
    getReserveHealth(),
  ] as const);

  const platformRevenue =
    Math.round((revenueAgg._sum.platformCut || 0) * 100) / 100;
  const watershedCredits =
    Math.round((revenueAgg._sum.watershedCredit || 0) * 100) / 100;

  // Compute trends (percentage change)
  function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  const curPlatformRev = currentRevenue._sum.platformCut || 0;
  const prevPlatformRev = prevRevenue._sum.platformCut || 0;
  const curWatershedCred = currentRevenue._sum.watershedCredit || 0;
  const prevWatershedCred = prevRevenue._sum.watershedCredit || 0;

  // Serialize activity items for client component
  const serializedActivity = recentActivity.map((item) => ({
    ...item,
    timestamp: item.timestamp.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm">
            Overview
          </h1>
          <p className="text-storm-light mt-1">
            Platform health at a glance.
          </p>
        </div>
        <AdminResetButton />
      </div>

      {/* Primary KPIs with trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          title="Platform Revenue"
          value={formatCurrency(platformRevenue)}
          subtitle="40% of gross ad revenue"
          icon={DollarSign}
          trend={{
            value: pctChange(curPlatformRev, prevPlatformRev),
            label: "vs prev 7d",
          }}
        />
        <AnalyticsCard
          title="Watershed Credits"
          value={formatCurrency(watershedCredits)}
          subtitle="60% distributed to users"
          icon={Droplets}
          trend={{
            value: pctChange(curWatershedCred, prevWatershedCred),
            label: "vs prev 7d",
          }}
        />
        <AnalyticsCard
          title="Active Users (7d)"
          value={activeUsers7d}
          subtitle={`${totalUsers} total registered`}
          icon={Users}
          trend={{
            value: pctChange(currentActiveUsers, prevActiveUsers),
            label: "vs prev 7d",
          }}
        />
        <AnalyticsCard
          title="Total Ad Views"
          value={totalAdViews.toLocaleString()}
          icon={Tv}
          trend={{
            value: pctChange(currentAdViews, prevAdViews),
            label: "vs prev 7d",
          }}
        />
      </div>

      {/* Reserve Health */}
      <div className="mb-8">
        <ReserveHealthCard
          balance={reserveHealth.balance}
          pendingDisbursements={reserveHealth.pendingDisbursements}
          coverageRatio={reserveHealth.coverageRatio}
          healthStatus={reserveHealth.healthStatus}
        />
      </div>

      {/* Quick counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <AnalyticsCard
          title="Projects"
          value={projectStats}
          icon={FolderOpen}
        />
        <AnalyticsCard title="Loans" value={loanCount} icon={Banknote} />
        <AnalyticsCard
          title="Communities"
          value={communityCount}
          icon={Users2}
        />
      </div>

      {/* Flagged Items */}
      {flaggedItems.length > 0 && (
        <div className="mb-8">
          <FlaggedItemsCard items={flaggedItems} />
        </div>
      )}

      {/* Activity Feed */}
      <div className="mb-8">
        <ActivityFeed items={serializedActivity} />
      </div>

      {/* System Health */}
      <SystemHealthCard />
    </div>
  );
}
