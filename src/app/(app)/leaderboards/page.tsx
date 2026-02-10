"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Droplet,
  Heart,
  Tv,
  Award,
  Flame,
  Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  projectsFunded: number;
  totalLoans: number;
  loansFunded: number;
  totalWatershedFlow: number;
  totalAdsWatched: number;
  totalCommunities: number;
}

interface MonthStats {
  projectsFunded: number;
  loansFunded: number;
  newMembers: number;
  adsWatched: number;
}

interface CommunityImpact {
  id: string;
  name: string;
  memberCount: number;
  projectsBacked: number;
  loansSupported: number;
}

interface YourProgress {
  adsWatchedTotal: number;
  adsWatchedThisMonth: number;
  projectsBacked: number;
  loansFunded: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  communitiesJoined: number;
  watershedBalance: number;
  totalContributed: number;
}

interface ProgressData {
  platform: PlatformStats;
  thisMonth: MonthStats;
  topCommunities: CommunityImpact[];
  yourProgress: YourProgress;
}

export default function CommunityProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-storm-light py-12">
          Unable to load progress data.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-teal" />
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
            Community Progress
          </h1>
          <p className="text-storm-light text-sm">
            Together we&apos;re making a difference
          </p>
        </div>
      </div>

      {/* Platform-wide Impact */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white flex items-center gap-2">
            <Droplet className="h-5 w-5 text-ocean" />
            Platform Impact
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-ocean/5 rounded-lg">
              <p className="text-2xl font-bold text-ocean">
                {data.platform.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-storm-light">Members</p>
            </div>
            <div className="text-center p-4 bg-teal/5 rounded-lg">
              <p className="text-2xl font-bold text-teal">
                {data.platform.projectsFunded}
              </p>
              <p className="text-sm text-storm-light">Projects Funded</p>
            </div>
            <div className="text-center p-4 bg-gold/5 rounded-lg">
              <p className="text-2xl font-bold text-gold">
                {data.platform.loansFunded}
              </p>
              <p className="text-sm text-storm-light">Loans Funded</p>
            </div>
            <div className="text-center p-4 bg-sky/5 rounded-lg">
              <p className="text-2xl font-bold text-sky">
                {formatCurrency(data.platform.totalWatershedFlow)}
              </p>
              <p className="text-sm text-storm-light">Total Flow</p>
            </div>
          </div>

          {/* This Month */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
            <h3 className="text-sm font-medium text-storm dark:text-white mb-3">
              This Month
            </h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="teal" className="text-sm py-1 px-3">
                {data.thisMonth.projectsFunded} projects funded
              </Badge>
              <Badge variant="gold" className="text-sm py-1 px-3">
                {data.thisMonth.loansFunded} loans funded
              </Badge>
              <Badge variant="ocean" className="text-sm py-1 px-3">
                {data.thisMonth.newMembers} new members
              </Badge>
              <Badge variant="sky" className="text-sm py-1 px-3">
                {data.thisMonth.adsWatched.toLocaleString()} ads watched
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communities Making Waves */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-teal" />
            Communities Making Waves
          </h2>
        </CardHeader>
        <CardContent>
          {data.topCommunities.length === 0 ? (
            <p className="text-center text-storm-light py-6">
              No community activity yet.{" "}
              <Link href="/communities" className="text-ocean hover:underline">
                Join or create a community
              </Link>{" "}
              to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {data.topCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <p className="font-medium text-storm dark:text-white">
                        {community.name}
                      </p>
                      <p className="text-sm text-storm-light">
                        {community.memberCount} members
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-teal">
                        {community.projectsBacked}
                      </p>
                      <p className="text-storm-light text-xs">projects</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gold">
                        {community.loansSupported}
                      </p>
                      <p className="text-storm-light text-xs">loans</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Progress (Private) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg text-storm dark:text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-ocean" />
              Your Progress
            </h2>
            <Badge variant="default" className="text-xs">
              Private
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <Tv className="h-4 w-4 text-storm-light" />
                <span className="text-xs text-storm-light">Ads Watched</span>
              </div>
              <p className="text-xl font-bold text-storm dark:text-white">
                {data.yourProgress.adsWatchedTotal}
              </p>
              <p className="text-xs text-storm-light">
                {data.yourProgress.adsWatchedThisMonth} this month
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-storm-light" />
                <span className="text-xs text-storm-light">Projects</span>
              </div>
              <p className="text-xl font-bold text-storm dark:text-white">
                {data.yourProgress.projectsBacked}
              </p>
              <p className="text-xs text-storm-light">backed</p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="h-4 w-4 text-storm-light" />
                <span className="text-xs text-storm-light">Loans</span>
              </div>
              <p className="text-xl font-bold text-storm dark:text-white">
                {data.yourProgress.loansFunded}
              </p>
              <p className="text-xs text-storm-light">funded</p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-storm-light" />
                <span className="text-xs text-storm-light">Badges</span>
              </div>
              <p className="text-xl font-bold text-storm dark:text-white">
                {data.yourProgress.badgesEarned}
              </p>
              <p className="text-xs text-storm-light">earned</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-gold" />
              <span className="text-sm text-storm dark:text-white">
                <strong>{data.yourProgress.currentStreak}</strong> day streak
              </span>
              {data.yourProgress.longestStreak > 0 && (
                <span className="text-xs text-storm-light">
                  (best: {data.yourProgress.longestStreak})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-teal" />
              <span className="text-sm text-storm dark:text-white">
                <strong>{data.yourProgress.communitiesJoined}</strong> communities
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-ocean" />
              <span className="text-sm text-storm dark:text-white">
                <strong>{formatCurrency(data.yourProgress.totalContributed)}</strong>{" "}
                contributed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
