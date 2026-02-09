"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FollowButton } from "./follow-button";
import { ShareModal } from "./share-modal";
import { RallyCard } from "./rally-card";
import { RallyCreateModal } from "./rally-create-modal";
import { MomentumIndicator } from "./momentum-indicator";
import { Share2, Megaphone } from "lucide-react";

interface Rally {
  id: string;
  title: string;
  targetType: "backers" | "amount";
  targetValue: number;
  deadline: string;
  status: string;
  creator?: { name: string | null };
  _count?: { participants: number };
  progress?: number;
  currentValue?: number;
  isComplete?: boolean;
}

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
  fundingPercent: number;
  projectStatus: string;
  isLoggedIn: boolean;
  momentumScore?: number;
  momentumTrend?: "rising" | "steady" | "new";
}

export function ProjectActions({
  projectId,
  projectTitle,
  fundingPercent,
  projectStatus,
  isLoggedIn,
  momentumScore,
  momentumTrend,
}: ProjectActionsProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [rallyModalOpen, setRallyModalOpen] = useState(false);
  const [rallies, setRallies] = useState<Rally[]>([]);
  const [joinedRallies, setJoinedRallies] = useState<Set<string>>(new Set());
  const [loadingRallies, setLoadingRallies] = useState(true);

  useEffect(() => {
    async function fetchRallies() {
      try {
        const res = await fetch(`/api/projects/${projectId}/rallies`);
        if (res.ok) {
          const data = await res.json();
          setRallies(data);
        }
      } finally {
        setLoadingRallies(false);
      }
    }

    fetchRallies();
  }, [projectId]);

  useEffect(() => {
    async function checkJoinedRallies() {
      if (!isLoggedIn || rallies.length === 0) return;

      const joinedSet = new Set<string>();
      for (const rally of rallies) {
        try {
          const res = await fetch(`/api/rallies/${rally.id}/join`);
          if (res.ok) {
            const data = await res.json();
            if (data.joined) {
              joinedSet.add(rally.id);
            }
          }
        } catch {
          // Ignore errors
        }
      }
      setJoinedRallies(joinedSet);
    }

    checkJoinedRallies();
  }, [isLoggedIn, rallies]);

  async function handleRallyCreated() {
    const res = await fetch(`/api/projects/${projectId}/rallies`);
    if (res.ok) {
      const data = await res.json();
      setRallies(data);
    }
  }

  const activeRallies = rallies.filter(
    (r) => r.status === "active" && new Date(r.deadline) > new Date()
  );
  const pastRallies = rallies.filter(
    (r) => r.status !== "active" || new Date(r.deadline) <= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Action buttons row */}
      <div className="flex items-center gap-3 flex-wrap">
        <MomentumIndicator
          projectId={projectId}
          initialScore={momentumScore}
          initialTrend={momentumTrend}
        />

        {isLoggedIn && <FollowButton projectId={projectId} />}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        {isLoggedIn && projectStatus === "active" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRallyModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Megaphone className="h-4 w-4" />
            Start Rally
          </Button>
        )}
      </div>

      {/* Active Rallies */}
      {activeRallies.length > 0 && (
        <div>
          <h3 className="font-semibold text-storm mb-3">Active Rallies</h3>
          <div className="space-y-3">
            {activeRallies.map((rally) => (
              <RallyCard
                key={rally.id}
                rally={rally}
                hasJoined={joinedRallies.has(rally.id)}
                onJoin={() => setJoinedRallies(new Set([...joinedRallies, rally.id]))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Rallies */}
      {pastRallies.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-storm-light hover:text-storm">
            {pastRallies.length} past {pastRallies.length === 1 ? "rally" : "rallies"}
          </summary>
          <div className="mt-3 space-y-3">
            {pastRallies.map((rally) => (
              <RallyCard key={rally.id} rally={rally} />
            ))}
          </div>
        </details>
      )}

      {loadingRallies && (
        <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
      )}

      {/* Modals */}
      <ShareModal
        projectId={projectId}
        projectTitle={projectTitle}
        fundingPercent={fundingPercent}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <RallyCreateModal
        projectId={projectId}
        isOpen={rallyModalOpen}
        onClose={() => setRallyModalOpen(false)}
        onCreated={handleRallyCreated}
      />
    </div>
  );
}
