"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle, Zap, Users, FolderOpen, MapPin } from "lucide-react";

interface ImpactStats {
  totalFunded: number;
  projectsCompleted: number;
  activeCampaigns: number;
  memberCount: number;
  projectCount: number;
  subCommunityCount?: number;
  isAggregated?: boolean;
}

interface ImpactStatsCardProps {
  communityId: string;
}

export function ImpactStatsCard({ communityId }: ImpactStatsCardProps) {
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/communities/${communityId}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [communityId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="font-heading font-semibold text-storm dark:text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-gold" />
          Our Impact
          {stats.isAggregated && (
            <span className="text-xs font-normal text-storm-light ml-1">
              (includes sub-regions)
            </span>
          )}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <StatBox
            icon={DollarSign}
            label="Total Funded"
            value={`$${stats.totalFunded.toFixed(2)}`}
            color="text-teal"
          />
          <StatBox
            icon={CheckCircle}
            label="Projects Completed"
            value={stats.projectsCompleted.toString()}
            color="text-ocean"
          />
          <StatBox
            icon={FolderOpen}
            label="Active Campaigns"
            value={stats.activeCampaigns.toString()}
            color="text-gold"
          />
          <StatBox
            icon={Users}
            label="Members"
            value={stats.memberCount.toString()}
            color="text-sky"
          />
        </div>

        {stats.subCommunityCount !== undefined && stats.subCommunityCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-storm-light">
              <MapPin className="h-4 w-4" />
              <span>Includes {stats.subCommunityCount} sub-region{stats.subCommunityCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-storm-light dark:text-gray-400">{label}</span>
      </div>
      <p className="font-heading font-bold text-lg text-storm dark:text-white">
        {value}
      </p>
    </div>
  );
}
