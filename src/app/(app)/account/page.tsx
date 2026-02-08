"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { EditNameForm } from "@/components/account/edit-name-form";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import { Tv, Heart, DollarSign, FolderOpen, Mail, Calendar, Shield, Award, TrendingUp, SlidersHorizontal, FileText, User, BarChart3, Settings } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import Link from "next/link";

interface AccountData {
  user: {
    name: string;
    email: string;
    accountType: string;
    creditTier: number;
    createdAt: string;
  };
  platformRoles: { role: string; grantedAt: string }[];
  stats: {
    adViewCount: number;
    totalAdCredits: number;
    totalContributions: number;
    totalDeployed: number;
    projectCount: number;
  };
  tierInfo: {
    name: string;
    maxAmount: number;
    maxMonths: number;
  };
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "impact", label: "Impact", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/account")
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "unauthenticated") redirect("/login");

  if (loading || !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-storm/10 rounded animate-pulse" />
          <div className="h-4 w-32 bg-storm/10 rounded animate-pulse mt-2" />
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-storm/10 rounded-xl animate-pulse" />
          <div className="h-12 bg-storm/10 rounded-lg animate-pulse" />
          <div className="h-48 bg-storm/10 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { user, platformRoles, stats, tierInfo } = data;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl text-storm dark:text-dark-text">
          Your Account
        </h1>
        <p className="text-storm-light dark:text-dark-text-secondary mt-1">
          Your profile and lifetime impact.
        </p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {/* Profile Tab */}
        <TabPanel id="profile" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
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

            {/* Credit Tier */}
            <Card>
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
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center dark:bg-ocean/20">
                    <span className="text-lg font-bold text-ocean dark:text-ocean-light">{user.creditTier}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-storm dark:text-dark-text">
                      Tier {user.creditTier} - {tierInfo.name}
                    </p>
                    <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                      Up to ${tierInfo.maxAmount} loans, {tierInfo.maxMonths}-month max term
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

            {/* Account Info */}
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
        </TabPanel>

        {/* Impact Tab */}
        <TabPanel id="impact" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Impact Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Tv className="h-4 w-4 text-teal" />
                    <span className="text-sm text-storm-light dark:text-dark-text-secondary">Ads Watched</span>
                  </div>
                  <p className="text-2xl font-heading font-bold text-storm dark:text-dark-text">
                    {stats.adViewCount}
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
                    {formatCurrencyPrecise(stats.totalAdCredits)}
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
                    {formatCurrency(stats.totalContributions)}
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
                    {formatCurrency(stats.totalDeployed)}
                  </p>
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                    {stats.projectCount} project{stats.projectCount !== 1 ? "s" : ""} funded
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Badges Link */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gold" />
                    <span className="font-heading font-semibold text-storm dark:text-dark-text">
                      Badges
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
                  Earn badges for watching ads, funding projects, and giving.
                </p>
              </CardContent>
            </Card>

            {/* Giving History Link */}
            <Card>
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
          </div>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel id="settings" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Ad Preferences */}
            <Card>
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

            {/* Recurring Giving */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-ocean" />
                    <span className="font-heading font-semibold text-storm dark:text-dark-text">
                      Recurring Giving
                    </span>
                  </div>
                  <Link
                    href="/account/recurring"
                    className="text-sm text-ocean hover:underline dark:text-ocean-light"
                  >
                    Manage &rarr;
                  </Link>
                </div>
                <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
                  Manage your recurring contributions and subscriptions.
                </p>
              </CardContent>
            </Card>

            {/* Referrals */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-teal" />
                    <span className="font-heading font-semibold text-storm dark:text-dark-text">
                      Referrals
                    </span>
                  </div>
                  <Link
                    href="/account/referrals"
                    className="text-sm text-ocean hover:underline dark:text-ocean-light"
                  >
                    View &rarr;
                  </Link>
                </div>
                <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
                  Invite friends and earn credits when they join.
                </p>
              </CardContent>
            </Card>

            {/* Credit Dashboard */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-ocean" />
                    <span className="font-heading font-semibold text-storm dark:text-dark-text">
                      Credit Dashboard
                    </span>
                  </div>
                  <Link
                    href="/credit"
                    className="text-sm text-ocean hover:underline dark:text-ocean-light"
                  >
                    View &rarr;
                  </Link>
                </div>
                <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
                  View your credit reporting status and payment history.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
