import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BalanceDisplay } from "@/components/watershed/balance-display";
import { SourceBreakdown } from "@/components/watershed/source-breakdown";
import { TransactionHistory } from "@/components/watershed/transaction-history";
import { OnboardingLoader } from "@/components/onboarding/onboarding-loader";
import { QuickStartCard } from "@/components/onboarding/quick-start-card";
import { Card, CardContent } from "@/components/ui/card";
import { DAILY_AD_CAP } from "@/lib/constants";
import { Tv, Heart, FolderOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [watershed, adViewCount, allocationCount, todayAdCount, user] =
    await Promise.all([
      prisma.watershed.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      }),
      prisma.adView.count({ where: { userId } }),
      prisma.allocation.count({ where: { userId } }),
      prisma.adView.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingComplete: true },
      }),
    ]);

  // Calculate source breakdown
  const [adCreditsAgg, cashContribAgg] = await Promise.all([
    prisma.adView.aggregate({
      where: { userId },
      _sum: { watershedCredit: true },
    }),
    prisma.contribution.aggregate({
      where: { userId },
      _sum: { watershedCredit: true },
    }),
  ]);

  const adCredits = adCreditsAgg._sum.watershedCredit ?? 0;
  const cashContributions = cashContribAgg._sum.watershedCredit ?? 0;

  const onboardingComplete = user?.onboardingComplete ?? true;

  return (
    <div>
      <OnboardingLoader isComplete={onboardingComplete} />

      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-storm-light mt-1">Your watershed is waiting.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceDisplay
            balance={watershed?.balance ?? 0}
            totalInflow={watershed?.totalInflow ?? 0}
            totalOutflow={watershed?.totalOutflow ?? 0}
          />

          <TransactionHistory
            transactions={watershed?.transactions ?? []}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Onboarding quick start card */}
          {!onboardingComplete && (
            <QuickStartCard
              onboardingComplete={onboardingComplete}
              hasWatchedAd={adViewCount > 0}
              hasBrowsedProjects={false}
              hasFundedProject={allocationCount > 0}
            />
          )}

          {/* Today's Activity */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Tv className="h-4 w-4 text-teal" />
                <span className="text-sm font-medium text-storm dark:text-dark-text">
                  Today&apos;s Activity
                </span>
              </div>
              <p className="text-2xl font-heading font-bold text-storm dark:text-dark-text mb-2">
                {todayAdCount} / {DAILY_AD_CAP} ads
              </p>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-teal rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todayAdCount / DAILY_AD_CAP) * 100, 100)}%` }}
                />
              </div>
              <Link
                href="/watch"
                className="text-sm text-ocean hover:underline dark:text-ocean-light inline-block"
              >
                Watch more &rarr;
              </Link>
            </CardContent>
          </Card>

          {/* Impact Summary */}
          <Card>
            <CardContent className="pt-5">
              <span className="text-sm font-medium text-storm dark:text-dark-text mb-3 block">
                Impact Summary
              </span>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tv className="h-3.5 w-3.5 text-teal" />
                    <span className="text-xs text-storm-light dark:text-dark-text-secondary">Total Ads</span>
                  </div>
                  <p className="text-xl font-heading font-bold text-storm dark:text-dark-text">
                    {adViewCount}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="h-3.5 w-3.5 text-ocean" />
                    <span className="text-xs text-storm-light dark:text-dark-text-secondary">Funded</span>
                  </div>
                  <p className="text-xl font-heading font-bold text-storm dark:text-dark-text">
                    {allocationCount}
                  </p>
                </div>
              </div>
              <Link
                href="/projects"
                className="text-sm text-ocean hover:underline dark:text-ocean-light inline-block"
              >
                Browse projects &rarr;
              </Link>
            </CardContent>
          </Card>

          <SourceBreakdown
            adCredits={adCredits}
            cashContributions={cashContributions}
          />

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/watch"
              className="flex items-center gap-2 p-3 bg-teal/10 text-teal rounded-lg text-sm font-medium hover:bg-teal/20 transition-colors dark:bg-teal/20 dark:hover:bg-teal/30"
            >
              <Tv className="h-4 w-4" />
              Watch Ads
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-2 p-3 bg-ocean/10 text-ocean rounded-lg text-sm font-medium hover:bg-ocean/20 transition-colors dark:bg-ocean/20 dark:hover:bg-ocean/30"
            >
              <FolderOpen className="h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
