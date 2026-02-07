import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DollarSign, Droplets, Tv, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { getPendingRevenueSummary } from "@/lib/settlement";

export default async function RevenuePage() {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") redirect("/dashboard");

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const currentPeriodStart = new Date(now - sevenDaysMs);
  const prevPeriodStart = new Date(now - 2 * sevenDaysMs);

  const [
    revenueAgg,
    totalAdViews,
    completionAgg,
    contributionAgg,
    currentRevenue,
    prevRevenue,
    currentAdViews,
    prevAdViews,
    revenueBreakdown,
  ] = await Promise.all([
    prisma.adView.aggregate({
      _sum: { platformCut: true, watershedCredit: true, grossRevenue: true },
    }),
    prisma.adView.count(),
    prisma.adView.aggregate({ _avg: { completionRate: true } }),
    prisma.contribution.aggregate({
      _sum: { watershedCredit: true },
    }),
    prisma.adView.aggregate({
      where: { createdAt: { gte: currentPeriodStart } },
      _sum: { platformCut: true, watershedCredit: true, grossRevenue: true },
    }),
    prisma.adView.aggregate({
      where: {
        createdAt: { gte: prevPeriodStart, lt: currentPeriodStart },
      },
      _sum: { platformCut: true, watershedCredit: true, grossRevenue: true },
    }),
    prisma.adView.count({
      where: { createdAt: { gte: currentPeriodStart } },
    }),
    prisma.adView.count({
      where: {
        createdAt: { gte: prevPeriodStart, lt: currentPeriodStart },
      },
    }),
    getPendingRevenueSummary(),
  ] as const);

  const grossRevenue =
    Math.round((revenueAgg._sum.grossRevenue || 0) * 100) / 100;
  const platformRevenue =
    Math.round((revenueAgg._sum.platformCut || 0) * 100) / 100;
  const watershedCredits =
    Math.round((revenueAgg._sum.watershedCredit || 0) * 100) / 100;
  const avgRevPerView =
    totalAdViews > 0
      ? Math.round((grossRevenue / totalAdViews) * 10000) / 10000
      : 0;
  const avgCompletion = Math.round(
    (completionAgg._avg.completionRate || 0) * 100
  );
  const totalContributions =
    Math.round((contributionAgg._sum.watershedCredit || 0) * 100) / 100;

  const platformPct =
    grossRevenue > 0
      ? Math.round((platformRevenue / grossRevenue) * 100)
      : 40;
  const watershedPct = 100 - platformPct;

  function pctChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  const curPlatformRev = currentRevenue._sum.platformCut || 0;
  const prevPlatformRev = prevRevenue._sum.platformCut || 0;
  const curWatershedCred = currentRevenue._sum.watershedCredit || 0;
  const prevWatershedCred = prevRevenue._sum.watershedCredit || 0;
  const curAvgRev =
    currentAdViews > 0
      ? (currentRevenue._sum.grossRevenue || 0) / currentAdViews
      : 0;
  const prevAvgRev =
    prevAdViews > 0
      ? (prevRevenue._sum.grossRevenue || 0) / prevAdViews
      : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">Revenue</h1>
        <p className="text-storm-light mt-1">
          Ad income, fees, and revenue distribution.
        </p>
      </div>

      {/* KPI cards with trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsCard
          title="Platform Revenue"
          value={formatCurrency(platformRevenue)}
          subtitle="40% of gross"
          icon={DollarSign}
          trend={{
            value: pctChange(curPlatformRev, prevPlatformRev),
            label: "vs prev 7d",
          }}
        />
        <AnalyticsCard
          title="Watershed Credits"
          value={formatCurrency(watershedCredits)}
          subtitle="60% to users"
          icon={Droplets}
          trend={{
            value: pctChange(curWatershedCred, prevWatershedCred),
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
        <AnalyticsCard
          title="Avg Revenue/View"
          value={`$${avgRevPerView.toFixed(4)}`}
          icon={TrendingUp}
          trend={{
            value: pctChange(curAvgRev, prevAvgRev),
            label: "vs prev 7d",
          }}
        />
      </div>

      {/* Revenue split visualization */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            Revenue Split
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm font-medium text-storm">
              Gross Revenue: {formatCurrency(grossRevenue)}
            </span>
          </div>
          <div className="w-full h-8 rounded-lg overflow-hidden flex">
            <div
              className="bg-ocean flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${platformPct}%` }}
            >
              {platformPct}% Platform
            </div>
            <div
              className="bg-teal flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${watershedPct}%` }}
            >
              {watershedPct}% Watershed
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-storm-light">
            <span>{formatCurrency(platformRevenue)} — Deluge operations</span>
            <span>{formatCurrency(watershedCredits)} — User watersheds</span>
          </div>
        </CardContent>
      </Card>

      {/* Pending vs Cleared Revenue */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            Settlement Status
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs text-storm-light">Pending Revenue</p>
                <p className="text-xl font-bold text-storm">
                  {formatCurrency(revenueBreakdown.pending.gross)}
                </p>
                <p className="text-xs text-storm-light">
                  {revenueBreakdown.pending.count} ad views awaiting settlement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-storm-light">Cleared Revenue</p>
                <p className="text-xl font-bold text-storm">
                  {formatCurrency(revenueBreakdown.cleared.gross)}
                </p>
                <p className="text-xs text-storm-light">
                  {revenueBreakdown.cleared.count} ad views settled
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <AnalyticsCard
          title="Avg Completion Rate"
          value={`${avgCompletion}%`}
          subtitle="Of ad views fully watched"
        />
        <AnalyticsCard
          title="Total Contributions"
          value={formatCurrency(totalContributions)}
          subtitle="Direct cash contributions credited"
        />
      </div>

      {/* Chart */}
      <RevenueChart />
    </div>
  );
}
