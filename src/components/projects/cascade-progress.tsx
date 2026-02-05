"use client";

import { motion } from "framer-motion";
import { getCascadeStage, CASCADE_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CascadeProgressProps {
  fundingRaised: number;
  fundingGoal: number;
}

const stageIcons: Record<string, string> = {
  Raindrop: "💧",
  Stream: "〰️",
  Creek: "🌿",
  River: "🌊",
  Cascade: "⛰️",
};

export function CascadeProgress({
  fundingRaised,
  fundingGoal,
}: CascadeProgressProps) {
  const currentStage = getCascadeStage(fundingRaised, fundingGoal);
  const progress = currentStage.progress;

  return (
    <div className="space-y-4">
      {/* Stage indicators */}
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full" />
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cascade-gradient rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {CASCADE_STAGES.map((stage, i) => {
          const isReached = progress >= stage.threshold;
          const isCurrent = stage.name === currentStage.name;

          return (
            <motion.div
              key={stage.name}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all",
                  isCurrent
                    ? "border-ocean bg-ocean/10 scale-110 shadow-md"
                    : isReached
                    ? "border-teal bg-teal/10"
                    : "border-gray-300 bg-white"
                )}
              >
                {stageIcons[stage.name]}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 font-medium",
                  isCurrent
                    ? "text-ocean"
                    : isReached
                    ? "text-teal"
                    : "text-storm-light"
                )}
              >
                {stage.name}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isReached ? "text-storm-light" : "text-gray-400"
                )}
              >
                {Math.round(stage.threshold * 100)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
