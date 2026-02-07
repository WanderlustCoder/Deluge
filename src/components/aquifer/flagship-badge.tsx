"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlagshipBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function FlagshipBadge({ size = "md", className }: FlagshipBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium bg-gradient-to-r from-ocean to-teal text-white rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Sparkles className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      Deluge Flagship
    </span>
  );
}
