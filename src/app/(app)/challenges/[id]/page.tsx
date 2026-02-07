"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChallengeLeaderboard } from "@/components/challenges/challenge-leaderboard";
import { useToast } from "@/components/ui/toast";
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export default function ChallengeDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<any>(null);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [joining, setJoining] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState("");

  useEffect(() => {
    fetch(`/api/challenges/${params.id}`)
      .then((res) => res.json())
      .then((data) => setChallenge(data));

    // Fetch user's communities where they are admin
    fetch("/api/communities?myRole=admin")
      .then((res) => res.json())
      .then((data) => {
        setUserCommunities(Array.isArray(data) ? data : []);
      });
  }, [params.id]);

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  const metricConfig: Record<string, { label: string; icon: React.ElementType }> = {
    funding_amount: { label: "Total Funding Raised", icon: DollarSign },
    projects_funded: { label: "Projects Funded", icon: FolderOpen },
  };

  const metricInfo = metricConfig[challenge.metric] || metricConfig.funding_amount;
  const MetricIcon = metricInfo.icon;

  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const isActive = challenge.status === "active";
  const isUpcoming = startDate > now;

  // Communities user can join with (admin of, not already in challenge)
  const joinedCommunityIds = new Set(
    challenge.entries.map((e: any) => e.communityId)
  );
  const eligibleCommunities = userCommunities.filter(
    (c) => !joinedCommunityIds.has(c.id)
  );

  async function handleJoin() {
    if (!selectedCommunity) return;
    setJoining(true);

    try {
      const res = await fetch(`/api/challenges/${params.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: selectedCommunity }),
      });

      if (res.ok) {
        toast("Community joined the challenge!", "success");
        // Refresh challenge data
        const updated = await fetch(`/api/challenges/${params.id}`).then((r) =>
          r.json()
        );
        setChallenge(updated);
        setSelectedCommunity("");
      } else {
        const data = await res.json();
        toast(data.error || "Failed to join", "error");
      }
    } catch {
      toast("Failed to join challenge", "error");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/challenges"
          className="text-sm text-ocean hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          All Challenges
        </Link>
      </div>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
                  {challenge.title}
                </h1>
                <p className="text-storm-light dark:text-gray-400">
                  {challenge.entries.length} communities participating
                </p>
              </div>
            </div>
            <Badge
              variant={isActive ? "success" : isUpcoming ? "ocean" : "default"}
              className="text-sm"
            >
              {isActive ? "Active" : isUpcoming ? "Upcoming" : "Completed"}
            </Badge>
          </div>

          <p className="text-storm dark:text-gray-300 mb-6">
            {challenge.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-storm-light dark:text-gray-400">
              <MetricIcon className="h-4 w-4" />
              <span>Metric: {metricInfo.label}</span>
            </div>
            <div className="flex items-center gap-2 text-storm-light dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </span>
            </div>
            {isActive && (
              <div className="flex items-center gap-2 text-ocean">
                <span>Ends {formatDistanceToNow(endDate, { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Join section */}
      {isActive && eligibleCommunities.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm dark:text-white mb-3">
              Join This Challenge
            </h3>
            <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
              Select a community you admin to participate in this challenge.
            </p>
            <div className="flex gap-3">
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white focus:outline-none focus:ring-2 focus:ring-ocean/50"
              >
                <option value="">Select a community...</option>
                {eligibleCommunities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleJoin}
                loading={joining}
                disabled={!selectedCommunity}
              >
                Join Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <ChallengeLeaderboard
        entries={challenge.entries}
        metric={challenge.metric}
        showAll
      />
    </div>
  );
}
