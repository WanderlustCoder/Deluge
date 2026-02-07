"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Droplets, Waves, Target } from "lucide-react";

interface FundCardProps {
  type: "reserve" | "pool";
  balance: number;
  userContribution?: number;
  planTitle?: string;
  fundingGoal?: number;
  progress?: number;
  className?: string;
}

export function FundCard({
  type,
  balance,
  userContribution,
  planTitle,
  fundingGoal,
  progress,
  className,
}: FundCardProps) {
  const isReserve = type === "reserve";
  const progressPercent = Math.round((progress || 0) * 100);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "h-2",
          isReserve
            ? "bg-gradient-to-r from-ocean to-ocean-light"
            : "bg-gradient-to-r from-teal to-teal-light"
        )}
      />
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isReserve ? (
                <Droplets className="h-5 w-5 text-ocean" />
              ) : (
                <Waves className="h-5 w-5 text-teal" />
              )}
              <h3 className="font-heading font-semibold text-storm dark:text-dark-text">
                {isReserve ? "Reserve" : "Pool"}
              </h3>
            </div>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-3">
              {isReserve
                ? "Deluge-directed flagship funding"
                : "Community-voted flagship funding"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-storm-light dark:text-dark-text-secondary">
              Balance
            </span>
            <span className="text-2xl font-heading font-bold text-storm dark:text-dark-text">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              {fundingGoal ? (
                <span className="text-storm-light dark:text-dark-text-secondary text-lg font-normal">
                  {" / $"}
                  {fundingGoal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              ) : null}
            </span>
          </div>

          {/* Strategic Plan Progress (Reserve only) */}
          {isReserve && planTitle && (
            <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-4 w-4 text-gold" />
                <span className="text-sm text-storm-light dark:text-dark-text-secondary">
                  Building toward:{" "}
                  <span className="font-medium text-storm dark:text-dark-text">
                    {planTitle}
                  </span>
                </span>
              </div>
              <div className="relative h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                {progressPercent}% of goal reached
              </p>
            </div>
          )}

          {!isReserve && userContribution !== undefined && (
            <div className="flex items-baseline justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
              <span className="text-sm text-storm-light dark:text-dark-text-secondary">
                Your contribution
              </span>
              <span className="text-lg font-semibold text-teal">
                ${userContribution.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
