"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vote, UserPlus, Crown } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/i18n/formatting";

interface Nomination {
  nomineeId: string;
  nominatedBy: string;
  votes: number;
  nomineeName?: string;
}

interface Election {
  id: string;
  role: string;
  status: string;
  nominationEnd: string;
  votingEnd: string;
  winnerId: string | null;
  nominations: Nomination[];
  totalVotes: number;
  userVoted: boolean;
}

interface Props {
  election: Election;
  communityId: string;
  members: Array<{ userId: string; name: string }>;
  currentUserId: string;
  onUpdate: () => void;
}

export function ElectionCard({ election, communityId, members, currentUserId, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [nomineeId, setNomineeId] = useState("");

  const now = new Date();
  const isNominating = election.status === "nominating" && new Date(election.nominationEnd) > now;
  const isVoting =
    (election.status === "voting" || (election.status === "nominating" && new Date(election.nominationEnd) <= now)) &&
    new Date(election.votingEnd) > now;
  const isCompleted = election.status === "completed";

  const memberMap = Object.fromEntries(members.map((m) => [m.userId, m.name]));

  async function handleNominate() {
    if (!nomineeId) return;
    setLoading(true);
    await fetch(`/api/communities/${communityId}/elections/${election.id}/nominate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId }),
    });
    setLoading(false);
    setNomineeId("");
    onUpdate();
  }

  async function handleVote(targetId: string) {
    setLoading(true);
    await fetch(`/api/communities/${communityId}/elections/${election.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId: targetId }),
    });
    setLoading(false);
    onUpdate();
  }

  const roleLabel = election.role.replace("steward:", "Steward: ").replace("steward", "Steward").replace("champion", "Champion");

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-gold" />
            <span className="font-heading font-semibold text-storm text-sm">
              {roleLabel}
            </span>
          </div>
          <Badge
            variant={
              isCompleted ? "success" : isVoting ? "ocean" : isNominating ? "default" : "danger"
            }
          >
            {isNominating ? "Nominating" : isVoting ? "Voting" : election.status}
          </Badge>
        </div>

        {/* Nominees & vote counts */}
        {election.nominations.length > 0 && (
          <div className="space-y-2 mb-3">
            {election.nominations.map((nom) => (
              <div
                key={nom.nomineeId}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-dark-border/50"
              >
                <span className="text-sm text-storm font-medium">
                  {memberMap[nom.nomineeId] || "Unknown"}
                  {nom.nomineeId === election.winnerId && (
                    <Crown className="inline h-3.5 w-3.5 ml-1 text-gold" />
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-storm-light">{nom.votes} votes</span>
                  {isVoting && !election.userVoted && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVote(nom.nomineeId)}
                      disabled={loading}
                    >
                      <Vote className="h-3.5 w-3.5 mr-1" />
                      Vote
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {election.nominations.length === 0 && isNominating && (
          <p className="text-sm text-storm-light mb-3">No nominations yet.</p>
        )}

        {/* Nominate form */}
        {isNominating && (
          <div className="flex gap-2">
            <select
              value={nomineeId}
              onChange={(e) => setNomineeId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-storm"
            >
              <option value="">Nominate a member...</option>
              {members
                .filter(
                  (m) => !election.nominations.some((n) => n.nomineeId === m.userId)
                )
                .map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} {m.userId === currentUserId ? "(you)" : ""}
                  </option>
                ))}
            </select>
            <Button
              size="sm"
              onClick={handleNominate}
              disabled={!nomineeId || loading}
              loading={loading}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Nominate
            </Button>
          </div>
        )}

        {/* Timeline */}
        <div className="flex gap-4 mt-3 text-xs text-storm-light">
          <span>Nominations end: {formatDate(election.nominationEnd)}</span>
          <span>Voting ends: {formatDate(election.votingEnd)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
