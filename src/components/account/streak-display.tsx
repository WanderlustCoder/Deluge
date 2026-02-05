"use client";

import { Flame, Trophy } from "lucide-react";

interface StreakDisplayProps {
  currentDays: number;
  longestDays: number;
}

export function StreakDisplay({ currentDays, longestDays }: StreakDisplayProps) {
  return (
    <div className="flex gap-6">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-gold" />
        <div>
          <p className="text-xl font-heading font-bold text-storm">
            {currentDays}
          </p>
          <p className="text-xs text-storm-light">Current Streak</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-storm-light" />
        <div>
          <p className="text-xl font-heading font-bold text-storm">
            {longestDays}
          </p>
          <p className="text-xs text-storm-light">Longest Streak</p>
        </div>
      </div>
    </div>
  );
}
