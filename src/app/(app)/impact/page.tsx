import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatCurrencyPrecise, formatNumber } from "@/lib/utils";
import { Droplets, Tv, Heart, Users, FolderOpen, TrendingUp } from "lucide-react";

export default async function ImpactPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [
    totalUsers,
    totalProjects,
    fundedProjects,
    totalAdViews,
    totalAllocations,
    adRevenueAgg,
    contributionsAgg,
    allocationsAgg,
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

  const totalAdRevenue = adRevenueAgg._sum.watershedCredit ?? 0;
  const totalContributions = contributionsAgg._sum.watershedCredit ?? 0;
  const totalFunded = allocationsAgg._sum.amount ?? 0;

  const stats = [
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
      value: formatNumber(fundedProjects),
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
      value: formatCurrencyPrecise(totalAdRevenue),
      icon: TrendingUp,
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      label: "Cash Contributed",
      value: formatCurrencyPrecise(totalContributions),
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
      value: formatCurrency(totalFunded),
      icon: TrendingUp,
      color: "text-teal",
      bg: "bg-teal/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Platform Impact
        </h1>
        <p className="text-storm-light mt-1">
          The collective power of the community, measured.
        </p>
      </div>

      {/* Hero stat */}
      <Card className="mb-8">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-storm-light uppercase tracking-wider mb-2">
            Total Community Impact
          </p>
          <p className="text-5xl font-heading font-bold text-ocean mb-2">
            {formatCurrency(totalFunded)}
          </p>
          <p className="text-storm-light">
            deployed to {fundedProjects} funded projects by {formatNumber(totalUsers)} users
          </p>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-heading font-bold text-storm">
                  {stat.value}
                </p>
                <p className="text-xs text-storm-light mt-0.5">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
