"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getCascadeStage } from "@/lib/constants";

interface ProgressBarProps {
  fundingRaised: number;
  fundingGoal: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const stageColors: Record<string, string> = {
  Raindrop: "bg-sky-light",
  Stream: "bg-sky",
  Creek: "bg-teal-light",
  River: "bg-teal",
  Cascade: "bg-ocean",
};

export function ProgressBar({
  fundingRaised,
  fundingGoal,
  showLabel = true,
  size = "md",
  className,
}: ProgressBarProps) {
  const stage = getCascadeStage(fundingRaised, fundingGoal);
  const percent = Math.round(stage.progress * 100);

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-storm dark:text-dark-text">
            {stage.name}
          </span>
          <span className="text-storm-light dark:text-dark-text-secondary">{percent}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden dark:bg-dark-border",
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${stage.name} stage: ${percent}% funded`}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            stageColors[stage.name] || "bg-sky"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
