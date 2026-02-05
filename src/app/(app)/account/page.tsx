import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditNameForm } from "@/components/account/edit-name-form";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import { Tv, Heart, DollarSign, FolderOpen, Mail, Calendar, Shield, Share2, Award } from "lucide-react";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [user, watershed, adViewCount, adCreditsAgg, contributionAgg, allocationAgg, projectsFunded] =
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
    ]);

  if (!user) redirect("/login");

  const totalAdCredits = adCreditsAgg._sum.watershedCredit ?? 0;
  const totalContributions = contributionAgg._sum.watershedCredit ?? 0;
  const totalDeployed = allocationAgg._sum.amount ?? 0;
  const projectCount = projectsFunded.length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Your Account
        </h1>
        <p className="text-storm-light mt-1">
          Your profile and lifetime impact.
        </p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-2xl text-storm">
                {user.name}
              </h2>
              <p className="text-storm-light">{user.email}</p>
            </div>
            <Badge variant={user.role === "admin" ? "gold" : "ocean"}>
              {user.role}
            </Badge>
          </div>
          <EditNameForm initialName={user.name} />
        </CardContent>
      </Card>

      {/* Impact Stats */}
      <h3 className="font-heading font-semibold text-lg text-storm mb-3">
        Lifetime Impact
      </h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Tv className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light">Ads Watched</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm">
              {adViewCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light">Earned from Ads</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm">
              {formatCurrencyPrecise(totalAdCredits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light">Cash Contributed</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm">
              {formatCurrency(totalContributions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm-light">Deployed to Projects</span>
            </div>
            <p className="text-2xl font-heading font-bold text-storm">
              {formatCurrency(totalDeployed)}
            </p>
            <p className="text-xs text-storm-light mt-1">
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
              <span className="font-heading font-semibold text-storm">
                Badges & Streaks
              </span>
            </div>
            <Link
              href="/account/badges"
              className="text-sm text-ocean hover:underline"
            >
              View All &rarr;
            </Link>
          </div>
          <p className="text-sm text-storm-light mt-1">
            Earn badges for watching ads, funding projects, and building streaks.
          </p>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-teal" />
              <span className="font-heading font-semibold text-storm">
                Invite Friends
              </span>
            </div>
            <Link
              href="/account/referrals"
              className="text-sm text-ocean hover:underline"
            >
              View Referrals &rarr;
            </Link>
          </div>
          <p className="text-sm text-storm-light mt-1">
            Earn watershed credit when friends join and get active.
          </p>
        </CardContent>
      </Card>

      {/* Account Info */}
      <h3 className="font-heading font-semibold text-lg text-storm mb-3">
        Account Info
      </h3>
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-storm-light" />
            <div>
              <p className="text-sm text-storm-light">Email</p>
              <p className="text-storm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-storm-light" />
            <div>
              <p className="text-sm text-storm-light">Role</p>
              <p className="text-storm capitalize">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-storm-light" />
            <div>
              <p className="text-sm text-storm-light">Member Since</p>
              <p className="text-storm">
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
