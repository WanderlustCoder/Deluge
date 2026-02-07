"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, DollarSign, FolderOpen } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ChallengeEntry {
  communityId: string;
  communityName: string;
  currentValue: number;
}

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    category?: string | null;
    metric: string;
    status: string;
    entries: ChallengeEntry[];
  };
}

const metricConfig: Record<string, { label: string; icon: React.ElementType; format: (v: number) => string }> = {
  funding_amount: {
    label: "Total Funding",
    icon: DollarSign,
    format: (v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  projects_funded: {
    label: "Projects Funded",
    icon: FolderOpen,
    format: (v) => `${v} project${v !== 1 ? "s" : ""}`,
  },
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const metricInfo = metricConfig[challenge.metric] || metricConfig.funding_amount;
  const MetricIcon = metricInfo.icon;

  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const isActive = challenge.status === "active";
  const isUpcoming = startDate > now;
  const isCompleted = challenge.status === "completed";

  // Get top 3 communities
  const topEntries = challenge.entries.slice(0, 3);
  const leader = topEntries[0];

  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card hover className="h-full">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" />
              <h3 className="font-heading font-semibold text-lg text-storm dark:text-white">
                {challenge.title}
              </h3>
            </div>
            <Badge
              variant={isActive ? "success" : isUpcoming ? "ocean" : "default"}
            >
              {isActive ? "Active" : isUpcoming ? "Upcoming" : "Completed"}
            </Badge>
          </div>

          <p className="text-sm text-storm-light dark:text-gray-400 mb-4 line-clamp-2">
            {challenge.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-storm-light dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <MetricIcon className="h-3 w-3" />
              {metricInfo.label}
            </span>
            {challenge.category && (
              <Badge variant="ocean" className="text-xs">{challenge.category}</Badge>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {challenge.entries.length} communities
            </span>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-xs text-storm-light dark:text-gray-400 mb-4">
            <Calendar className="h-3 w-3" />
            <span>
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </span>
            {isActive && (
              <span className="text-ocean font-medium">
                ({formatDistanceToNow(endDate, { addSuffix: true })} ends)
              </span>
            )}
          </div>

          {/* Leaderboard preview */}
          {challenge.entries.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-storm dark:text-gray-300 mb-2">
                Leaderboard
              </p>
              <div className="space-y-1">
                {topEntries.map((entry, index) => (
                  <div
                    key={entry.communityId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={
                          index === 0
                            ? "text-gold font-medium"
                            : "text-storm-light dark:text-gray-400"
                        }
                      >
                        #{index + 1}
                      </span>
                      <span className="text-storm dark:text-gray-300 truncate max-w-[150px]">
                        {entry.communityName}
                      </span>
                    </span>
                    <span className="text-storm-light dark:text-gray-400">
                      {metricInfo.format(entry.currentValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {challenge.entries.length === 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-storm-light dark:text-gray-400 text-center">
                No communities have joined yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
