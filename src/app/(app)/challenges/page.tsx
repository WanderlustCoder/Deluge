"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Trophy } from "lucide-react";

interface ChallengeEntry {
  communityId: string;
  communityName: string;
  currentValue: number;
}

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category?: string | null;
  metric: string;
  status: string;
  entries: ChallengeEntry[];
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        setChallenges(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-gold" />
          <h1 className="font-heading font-bold text-3xl text-storm dark:text-white">
            Community Challenges
          </h1>
        </div>
        <p className="text-storm-light dark:text-gray-400 max-w-2xl">
          Join friendly challenges with other communities. These aren't competitions
          against each other — they're opportunities to rally together and see what
          our communities can accomplish.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-heading font-bold text-ocean">
              {activeChallenges.length}
            </p>
            <p className="text-sm text-storm-light dark:text-gray-400">
              Active Challenges
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-heading font-bold text-teal">
              {challenges.reduce((sum, c) => sum + c.entries.length, 0)}
            </p>
            <p className="text-sm text-storm-light dark:text-gray-400">
              Communities Participating
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-heading font-bold text-gold">
              {completedChallenges.length}
            </p>
            <p className="text-sm text-storm-light dark:text-gray-400">
              Challenges Completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-ocean text-white"
                : "bg-gray-100 dark:bg-gray-800 text-storm-light dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenge list */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-storm-light dark:text-gray-400">
            {filter === "all"
              ? "No challenges yet. Check back soon!"
              : `No ${filter} challenges.`}
          </p>
        </div>
      )}
    </div>
  );
}
