"use client";

import { cn } from "@/lib/utils";

interface BadgeInfo {
  id: string;
  key: string;
  name: string;
  description: string;
  tier: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

interface BadgeGridProps {
  badges: BadgeInfo[];
}

const tierColors: Record<string, string> = {
  first_drop: "border-sky",
  stream: "border-teal",
  creek: "border-ocean",
};

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            "rounded-lg border-2 p-4 transition-all",
            badge.earned
              ? cn(tierColors[badge.tier] || "border-gray-300", "bg-white")
              : "border-gray-200 bg-gray-50 opacity-60"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <p className="font-heading font-semibold text-storm text-sm">
                {badge.name}
              </p>
              <p className="text-xs text-storm-light capitalize">
                {badge.tier.replace("_", " ")}
              </p>
            </div>
          </div>
          <p className="text-xs text-storm-light">{badge.description}</p>
          {badge.earned && badge.earnedAt && (
            <p className="text-xs text-teal mt-2">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
