"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Check, X, Clock, AlertCircle, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { AQUIFER_APPROVAL_THRESHOLD } from "@/lib/constants";

interface VoteTally {
  approve: number;
  reject: number;
  table: number;
  total: number;
}

interface CommunityRippleVoteProps {
  flagshipId: string;
  votingEndsAt: string | null;
  voteTally: VoteTally;
  userVote: "approve" | "reject" | "table" | null;
  isEligible: boolean;
  eligibilityReason?: string;
  onVoted?: () => void;
}

export function CommunityRippleVote({
  flagshipId,
  votingEndsAt,
  voteTally,
  userVote,
  isEligible,
  eligibilityReason,
  onVoted,
}: CommunityRippleVoteProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [tally, setTally] = useState(voteTally);

  const endDate = votingEndsAt ? new Date(votingEndsAt) : null;
  const now = new Date();
  const isExpired = endDate && now > endDate;
  const timeRemaining = endDate
    ? Math.max(0, endDate.getTime() - now.getTime())
    : 0;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  const approvalRate = tally.total > 0 ? tally.approve / tally.total : 0;
  const threshold = AQUIFER_APPROVAL_THRESHOLD * 100;

  async function handleVote(vote: "approve" | "reject" | "table") {
    if (!isEligible || isExpired) return;

    setLoading(vote);
    try {
      const res = await fetch(`/api/aquifer/projects/${flagshipId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentVote(vote);
        setTally(data.voteTally);
        toast(`Vote recorded: ${vote}`, "success");
        onVoted?.();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to vote", "error");
      }
    } catch {
      toast("Failed to vote", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-ocean" />
            <h3 className="font-heading font-semibold text-storm dark:text-dark-text">
              Community Ripple Vote
            </h3>
          </div>
          {endDate && !isExpired && (
            <span className="flex items-center gap-1 text-sm text-storm-light dark:text-dark-text-secondary">
              <Clock className="h-4 w-4" />
              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
            </span>
          )}
          {isExpired && (
            <span className="text-sm text-red-500">Voting ended</span>
          )}
        </div>

        {/* Vote counts */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600">{tally.approve}</div>
            <div className="text-xs text-green-600/70">Approve</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg dark:bg-red-900/20">
            <div className="text-2xl font-bold text-red-600">{tally.reject}</div>
            <div className="text-xs text-red-600/70">Reject</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg dark:bg-amber-900/20">
            <div className="text-2xl font-bold text-amber-600">{tally.table}</div>
            <div className="text-xs text-amber-600/70">Table</div>
          </div>
        </div>

        {/* Approval progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-storm-light dark:text-dark-text-secondary">
              Approval rate
            </span>
            <span
              className={cn(
                "font-medium",
                approvalRate >= AQUIFER_APPROVAL_THRESHOLD
                  ? "text-green-600"
                  : "text-storm"
              )}
            >
              {Math.round(approvalRate * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-dark-border">
            <div
              className={cn(
                "h-full transition-all duration-500",
                approvalRate >= AQUIFER_APPROVAL_THRESHOLD
                  ? "bg-green-500"
                  : "bg-ocean"
              )}
              style={{ width: `${Math.min(100, approvalRate * 100)}%` }}
            />
          </div>
          <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
            {threshold}% approval needed to fund from Pool
          </p>
        </div>

        {/* Vote buttons or eligibility message */}
        {!isEligible ? (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg dark:bg-amber-900/20">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {eligibilityReason || "You are not eligible to vote"}
            </p>
          </div>
        ) : isExpired ? (
          <div className="p-3 bg-gray-50 rounded-lg text-center dark:bg-dark-border">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              Voting has ended
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentVote && (
              <p className="text-sm text-storm-light dark:text-dark-text-secondary text-center">
                Your vote:{" "}
                <span className="font-medium capitalize">{currentVote}</span>
                {" (click to change)"}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={currentVote === "approve" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleVote("approve")}
                loading={loading === "approve"}
                disabled={loading !== null}
                className={cn(
                  currentVote === "approve" &&
                    "bg-green-600 hover:bg-green-700 border-green-600"
                )}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant={currentVote === "reject" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleVote("reject")}
                loading={loading === "reject"}
                disabled={loading !== null}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                variant={currentVote === "table" ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleVote("table")}
                loading={loading === "table"}
                disabled={loading !== null}
                className={cn(
                  currentVote === "table" &&
                    "bg-amber-500 hover:bg-amber-600 border-amber-500"
                )}
              >
                <Clock className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
