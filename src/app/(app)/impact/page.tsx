import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatCurrencyPrecise, formatNumber } from "@/lib/utils";
import {
  Droplets,
  Tv,
  Heart,
  Users,
  FolderOpen,
  TrendingUp,
  Calendar,
  Banknote,
} from "lucide-react";
import { ImpactTabs } from "@/components/impact/impact-tabs";
import { ImpactTimeline } from "@/components/impact/impact-timeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Impact",
  robots: { index: false },
};

export default async function ImpactPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Personal stats
  const [
    personalAdViews,
    personalAdRevenue,
    personalContributions,
    personalAllocations,
    personalAllocationsAgg,
    personalLoansShares,
    personalLoansAgg,
    fundedProjects,
    recentActivity,
  ] = await Promise.all([
    prisma.adView.count({ where: { userId } }),
    prisma.adView.aggregate({
      where: { userId },
      _sum: { watershedCredit: true },
    }),
    prisma.contribution.aggregate({
      where: { userId },
      _sum: { watershedCredit: true },
    }),
    prisma.allocation.count({ where: { userId } }),
    prisma.allocation.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.loanShare.count({ where: { funderId: userId } }),
    prisma.loanShare.aggregate({
      where: { funderId: userId },
      _sum: { amount: true },
    }),
    prisma.allocation.findMany({
      where: { userId },
      include: {
        project: { select: { title: true, status: true } },
      },
      distinct: ["projectId"],
    }),
    prisma.allocation.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, title: true, status: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Platform stats
  const [
    totalUsers,
    totalProjects,
    totalFundedProjects,
    totalAdViews,
    totalAllocations,
    platformAdRevenue,
    platformContributions,
    platformFunded,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: "funded" } }),
    prisma.adView.count(),
    prisma.allocation.count(),
    prisma.adView.aggregate({ _sum: { watershedCredit: true } }),
    prisma.contribution.aggregate({ _sum: { watershedCredit: true } }),
    prisma.allocation.aggregate({ _sum: { amount: true } }),
  ]);

  const myAdRevenue = personalAdRevenue._sum.watershedCredit ?? 0;
  const myCashContributions = personalContributions._sum.watershedCredit ?? 0;
  const myTotalFunded = personalAllocationsAgg._sum.amount ?? 0;
  const myLoansFunded = personalLoansAgg._sum.amount ?? 0;
  const myTotalImpact = myTotalFunded + myLoansFunded;
  const myProjectsCount = fundedProjects.length;
  const myCompletedProjects = fundedProjects.filter(
    (a) => a.project.status === "funded" || a.project.status === "completed"
  ).length;

  const platformTotal = platformFunded._sum.amount ?? 0;

  const personalStats = [
    {
      label: "Ads Watched",
      value: formatNumber(personalAdViews),
      icon: Tv,
      color: "text-sky",
      bg: "bg-sky/10",
    },
    {
      label: "Ad Revenue Earned",
      value: formatCurrencyPrecise(myAdRevenue),
      icon: TrendingUp,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      label: "Cash Contributed",
      value: formatCurrencyPrecise(myCashContributions),
      icon: Droplets,
      color: "text-ocean",
      bg: "bg-ocean/10",
    },
    {
      label: "Projects Backed",
      value: formatNumber(myProjectsCount),
      icon: FolderOpen,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Successful Projects",
      value: formatNumber(myCompletedProjects),
      icon: Heart,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      label: "Loans Funded",
      value: formatNumber(personalLoansShares),
      icon: Banknote,
      color: "text-sky",
      bg: "bg-sky/10",
    },
  ];

  const platformStats = [
    {
      label: "Total Users",
      value: formatNumber(totalUsers),
      icon: Users,
      color: "text-ocean",
      bg: "bg-ocean/10",
    },
    {
      label: "Projects",
      value: formatNumber(totalProjects),
      icon: FolderOpen,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      label: "Projects Funded",
      value: formatNumber(totalFundedProjects),
      icon: Heart,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Total Ads Watched",
      value: formatNumber(totalAdViews),
      icon: Tv,
      color: "text-sky",
      bg: "bg-sky/10",
    },
    {
      label: "Ad Revenue Earned",
      value: formatCurrencyPrecise(platformAdRevenue._sum.watershedCredit ?? 0),
      icon: TrendingUp,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      label: "Cash Contributed",
      value: formatCurrencyPrecise(platformContributions._sum.watershedCredit ?? 0),
      icon: Droplets,
      color: "text-ocean",
      bg: "bg-ocean/10",
    },
    {
      label: "Total Allocations",
      value: formatNumber(totalAllocations),
      icon: Heart,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Total Funded",
      value: formatCurrency(platformTotal),
      icon: TrendingUp,
      color: "text-teal",
      bg: "bg-teal/10",
    },
  ];

  const timelineItems = recentActivity.map((allocation) => ({
    id: allocation.id,
    type: "allocation" as const,
    amount: allocation.amount,
    projectId: allocation.projectId,
    projectTitle: allocation.project.title,
    projectCategory: allocation.project.category,
    projectStatus: allocation.project.status,
    date: allocation.createdAt,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm dark:text-white">
          My Impact
        </h1>
        <p className="text-storm-light dark:text-gray-400 mt-1">
          Track your contributions and see the difference you're making.
        </p>
      </div>

      {/* Personal Hero Stat */}
      <Card className="mb-8 bg-gradient-to-r from-ocean/5 to-teal/5 dark:from-ocean/10 dark:to-teal/10">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-storm-light dark:text-gray-400 uppercase tracking-wider mb-2">
            Your Total Impact
          </p>
          <p className="text-5xl font-heading font-bold text-ocean mb-2">
            {formatCurrency(myTotalImpact)}
          </p>
          <p className="text-storm-light dark:text-gray-400">
            deployed to {myProjectsCount} projects and {personalLoansShares} loans
          </p>
        </CardContent>
      </Card>

      <ImpactTabs
        personalStats={personalStats}
        platformStats={platformStats}
        platformTotal={platformTotal}
        totalFundedProjects={totalFundedProjects}
        totalUsers={totalUsers}
      />

      {/* Impact Timeline */}
      {timelineItems.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading font-bold text-xl text-storm dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-ocean" />
            Recent Activity
          </h2>
          <ImpactTimeline items={timelineItems} />
        </div>
      )}
    </div>
  );
}
