"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface RallyCardProps {
  rally: {
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
  };
  onJoin?: () => void;
  hasJoined?: boolean;
}

export function RallyCard({ rally, onJoin, hasJoined = false }: RallyCardProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(hasJoined);
  const [participantCount, setParticipantCount] = useState(
    rally._count?.participants || 0
  );

  const progress = rally.progress ?? 0;
  const isComplete = rally.isComplete ?? progress >= 100;
  const isExpired = new Date(rally.deadline) < new Date();
  const isActive = rally.status === "active" && !isExpired;

  async function handleJoin() {
    if (joining || joined || !isActive) return;

    setJoining(true);
    try {
      const res = await fetch(`/api/rallies/${rally.id}/join`, {
        method: "POST",
      });

      if (res.ok) {
        setJoined(true);
        setParticipantCount((c) => c + 1);
        onJoin?.();
      }
    } finally {
      setJoining(false);
    }
  }

  const targetLabel =
    rally.targetType === "backers"
      ? `${rally.targetValue} backers`
      : `$${rally.targetValue.toLocaleString()}`;

  const currentLabel =
    rally.targetType === "backers"
      ? `${rally.currentValue || 0} backers`
      : `$${(rally.currentValue || 0).toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 ${
        isComplete
          ? "border-teal bg-teal/5"
          : isActive
          ? "border-sky bg-sky/5"
          : "border-storm/30 bg-gray-50 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-ocean dark:text-white">
            {rally.title}
          </h4>
          {rally.creator?.name && (
            <p className="text-xs text-storm mt-0.5">
              Started by {rally.creator.name}
            </p>
          )}
        </div>

        {isComplete && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal text-white">
            Complete
          </span>
        )}
        {!isActive && !isComplete && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-storm/30 text-storm">
            Ended
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-storm mb-1">
          <span>{currentLabel}</span>
          <span>{targetLabel}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${isComplete ? "bg-teal" : "bg-sky"}`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-storm">
          <span>{participantCount} joined</span>
          {isActive && (
            <span>
              {formatDistanceToNow(new Date(rally.deadline), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>

        {isActive && !joined && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? "Joining..." : "Join Rally"}
          </Button>
        )}

        {isActive && joined && (
          <span className="text-xs text-teal font-medium">You joined</span>
        )}
      </div>
    </motion.div>
  );
}
