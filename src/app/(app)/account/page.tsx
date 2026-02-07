import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditNameForm } from "@/components/account/edit-name-form";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import { Tv, Heart, DollarSign, FolderOpen, Mail, Calendar, Shield, Award, TrendingUp, SlidersHorizontal, BadgeCheck, FileText } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { CREDIT_TIERS } from "@/lib/constants";
import { getTierName } from "@/lib/loans";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [user, watershed, adViewCount, adCreditsAgg, contributionAgg, allocationAgg, projectsFunded, platformRoles] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.watershed.findUnique({ where: { userId } }),
      prisma.adView.count({ where: { userId } }),
      prisma.adView.aggregate({
        where: { userId },
        _sum: { watershedCredit: true },
      }),
      prisma.contribution.aggregate({
        where: { userId },
        _sum: { watershedCredit: true },
      }),
      prisma.allocation.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.allocation.groupBy({
        by: ["projectId"],
        where: { userId },
      }),
      prisma.userRole.findMany({
        where: { userId, isActive: true },
        select: { role: true, grantedAt: true },
      }),
    ]);

  if (!user) redirect("/login");

  const totalAdCredits = adCreditsAgg._sum.watershedCredit ?? 0;
  const totalContributions = contributionAgg._sum.watershedCredit ?? 0;
  const totalDeployed = allocationAgg._sum.amount ?? 0;
  const projectCount = projectsFunded.length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm dark:text-dark-text">
          Your Account
        </h1>
        <p className="text-storm-light dark:text-dark-text-secondary mt-1">
          Your profile and lifetime impact.
        </p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
                {user.name}
              </h2>
              <p className="text-storm-light dark:text-dark-text-secondary">{user.email}</p>
            </div>
            <Badge variant={user.accountType === "admin" ? "gold" : "ocean"}>
              {user.accountType}
            </Badge>
          </div>

          {/* Platform Roles */}
          {platformRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {platformRoles.map((pr) => (
                <RoleBadge key={pr.role} role={pr.role} size="md" />
              ))}
            </div>
          )}
          <EditNameForm initialName={user.name} />
        </CardContent>
      </Card>

      {/* Impact Stats */}
      <h3 className="font-heading font-semibold text-lg text-storm dark:text-dark-text mb-3">
        Lifetime Impact
      </h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Tv className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light dark:text-dark-text-secondary">Ads Watched</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm dark:text-dark-text">
              {adViewCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light dark:text-dark-text-secondary">Earned from Ads</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm dark:text-dark-text">
              {formatCurrencyPrecise(totalAdCredits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light dark:text-dark-text-secondary">Cash Contributed</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm dark:text-dark-text">
              {formatCurrency(totalContributions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light dark:text-dark-text-secondary">Deployed to Projects</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm dark:text-dark-text">
              {formatCurrency(totalDeployed)}
            </p>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
              {projectCount} project{projectCount !== 1 ? "s" : ""} funded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gold" />
              <span className="font-heading font-semibold text-storm dark:text-dark-text">
                Badges & Streaks
              </span>
            </div>
            <Link
              href="/account/badges"
              className="text-sm text-ocean hover:underline dark:text-ocean-light"
            >
              View All &rarr;
            </Link>
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
            Earn badges for watching ads, funding projects, and building streaks.
          </p>
        </CardContent>
      </Card>

      {/* Giving History & Tax Documents */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-ocean" />
              <span className="font-heading font-semibold text-storm dark:text-dark-text">
                Giving History
              </span>
            </div>
            <Link
              href="/account/giving-history"
              className="text-sm text-ocean hover:underline dark:text-ocean-light"
            >
              View &rarr;
            </Link>
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
            Download receipts and annual summaries for your tax records.
          </p>
        </CardContent>
      </Card>

      {/* Credit Tier */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ocean" />
              <span className="font-heading font-semibold text-storm dark:text-dark-text">
                Credit Tier
              </span>
            </div>
            <Link
              href="/loans"
              className="text-sm text-ocean hover:underline dark:text-ocean-light"
            >
              View Loans &rarr;
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center">
              <span className="text-lg font-bold text-ocean">{user.creditTier}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-storm dark:text-dark-text">
                Tier {user.creditTier} - {getTierName(user.creditTier)}
              </p>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                Up to ${CREDIT_TIERS[user.creditTier - 1]?.maxAmount ?? 100} loans,{" "}
                {CREDIT_TIERS[user.creditTier - 1]?.maxMonths ?? 6}-month max term
              </p>
            </div>
          </div>
          {user.creditTier < 5 && (
            <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-3">
              Repay loans on time to unlock higher tiers with larger limits.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ad Preferences */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-storm dark:text-dark-text" />
              <span className="font-heading font-semibold text-storm dark:text-dark-text">
                Ad Preferences
              </span>
            </div>
            <Link
              href="/account/ad-preferences"
              className="text-sm text-ocean hover:underline dark:text-ocean-light"
            >
              Manage &rarr;
            </Link>
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
            Control which ad categories you see. Block topics you find irrelevant or offensive.
          </p>
        </CardContent>
      </Card>

      {/* Account Info */}
      <h3 className="font-heading font-semibold text-lg text-storm dark:text-dark-text mb-3">
        Account Info
      </h3>
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-storm-light dark:text-dark-text-secondary" />
            <div>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">Email</p>
              <p className="text-storm dark:text-dark-text">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-storm-light dark:text-dark-text-secondary" />
            <div>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">Role</p>
              <p className="text-storm dark:text-dark-text capitalize">{user.accountType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-storm-light dark:text-dark-text-secondary" />
            <div>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">Member Since</p>
              <p className="text-storm dark:text-dark-text">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
