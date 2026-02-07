"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  communityId: string;
  communityName?: string;
  community?: { id: string; name: string; memberCount?: number };
  currentValue: number;
}

interface ChallengeLeaderboardProps {
  entries: LeaderboardEntry[];
  metric: string;
  showAll?: boolean;
}

const metricFormat: Record<string, (v: number) => string> = {
  funding_amount: (v) =>
    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  projects_funded: (v) => `${v} project${v !== 1 ? "s" : ""}`,
};

export function ChallengeLeaderboard({
  entries,
  metric,
  showAll = false,
}: ChallengeLeaderboardProps) {
  const formatValue = metricFormat[metric] || metricFormat.funding_amount;
  const displayEntries = showAll ? entries : entries.slice(0, 10);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-storm-light dark:text-gray-400">
              No communities have joined this challenge yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h3 className="font-heading font-semibold text-storm dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          Community Leaderboard
        </h3>

        <div className="space-y-2">
          {displayEntries.map((entry, index) => {
            const name = entry.community?.name || entry.communityName || "Unknown";
            const communityId = entry.community?.id || entry.communityId;

            return (
              <Link
                key={entry.communityId}
                href={`/communities/${communityId}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={index + 1} />
                  <div>
                    <p className="font-medium text-storm dark:text-white">
                      {name}
                    </p>
                    {entry.community?.memberCount && (
                      <p className="text-xs text-storm-light dark:text-gray-400">
                        {entry.community.memberCount} members
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-semibold text-storm dark:text-white">
                    {formatValue(entry.currentValue)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {!showAll && entries.length > 10 && (
          <p className="text-center text-sm text-storm-light dark:text-gray-400 mt-4">
            + {entries.length - 10} more communities
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
        <Trophy className="h-4 w-4 text-gold" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <Medal className="h-4 w-4 text-gray-500" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <Award className="h-4 w-4 text-amber-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <span className="text-sm font-medium text-storm-light dark:text-gray-400">
        {rank}
      </span>
    </div>
  );
}
