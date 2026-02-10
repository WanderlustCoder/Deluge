"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: TooltipSide;
  className?: string;
}

const sideStyles: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  return (
    <div className={cn("relative inline-flex group", className)}>
      {children}
      <div
        role="tooltip"
        className={cn(
          "absolute z-50 hidden group-hover:block px-3 py-1.5 text-xs font-medium text-white bg-storm rounded-lg shadow-sm whitespace-nowrap pointer-events-none dark:bg-dark-elevated dark:text-dark-text dark:border dark:border-dark-border",
          sideStyles[side]
        )}
      >
        {content}
      </div>
    </div>
  );
}
