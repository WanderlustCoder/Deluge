"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type LeaderboardType =
  | "ads_month"
  | "ads_all"
  | "projects_month"
  | "projects_all"
  | "streaks"
  | "referrals";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  value: number;
}

const categories: { type: LeaderboardType; label: string }[] = [
  { type: "ads_month", label: "Ads (Month)" },
  { type: "ads_all", label: "Ads (All Time)" },
  { type: "projects_month", label: "Funding (Month)" },
  { type: "projects_all", label: "Funding (All Time)" },
  { type: "streaks", label: "Streaks" },
  { type: "referrals", label: "Referrals" },
];

const medalEmojis: Record<number, string> = {
  1: "\uD83E\uDD47",
  2: "\uD83E\uDD48",
  3: "\uD83E\uDD49",
};

function formatValue(value: number, type: LeaderboardType): string {
  if (type.startsWith("projects")) {
    return formatCurrency(value);
  }
  if (type === "streaks") {
    return `${value} day${value !== 1 ? "s" : ""}`;
  }
  return value.toString();
}

export default function LeaderboardsPage() {
  const { data: session } = useSession();
  const [activeType, setActiveType] = useState<LeaderboardType>("ads_all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] =
    useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboards?type=${activeType}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setCurrentUserRank(data.currentUserRank || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeType]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-gold" />
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm">
            Leaderboards
          </h1>
          <p className="text-storm-light text-sm">
            See how you rank in the community
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.type}
            onClick={() => setActiveType(cat.type)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeType === cat.type
                ? "bg-ocean text-white"
                : "bg-gray-100 text-storm-light hover:bg-gray-200"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-lg text-storm">
            {categories.find((c) => c.type === activeType)?.label} Rankings
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-storm-light py-8">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-storm-light py-8">
              No data yet. Be the first on the board!
            </p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => {
                const isCurrentUser =
                  entry.userId === session?.user?.id;
                const medal = medalEmojis[entry.rank];
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                      isCurrentUser
                        ? "bg-ocean/5 border border-ocean/20"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <span className="w-8 text-center text-sm font-semibold text-storm-light">
                      {medal || `#${entry.rank}`}
                    </span>
                    <span className="flex-1 font-medium text-storm text-sm">
                      {entry.name}
                      {isCurrentUser && (
                        <Badge variant="ocean" className="ml-2">
                          You
                        </Badge>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-storm">
                      {formatValue(entry.value, activeType)}
                    </span>
                  </div>
                );
              })}

              {/* Current user if not in top 20 */}
              {currentUserRank &&
                !entries.find(
                  (e) => e.userId === session?.user?.id
                ) && (
                  <>
                    <div className="text-center text-storm-light text-xs py-2">
                      &middot;&middot;&middot;
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-ocean/5 border border-ocean/20">
                      <span className="w-8 text-center text-sm font-semibold text-storm-light">
                        #{currentUserRank.rank}
                      </span>
                      <span className="flex-1 font-medium text-storm text-sm">
                        {currentUserRank.name}
                        <Badge variant="ocean" className="ml-2">
                          You
                        </Badge>
                      </span>
                      <span className="text-sm font-semibold text-storm">
                        {formatValue(currentUserRank.value, activeType)}
                      </span>
                    </div>
                  </>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
