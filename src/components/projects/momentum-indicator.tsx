"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MomentumIndicatorProps {
  projectId: string;
  initialScore?: number;
  initialTrend?: "rising" | "steady" | "new";
  size?: "sm" | "md" | "lg";
}

export function MomentumIndicator({
  projectId,
  initialScore,
  initialTrend,
  size = "md",
}: MomentumIndicatorProps) {
  const [score, setScore] = useState(initialScore ?? 0);
  const [trend, setTrend] = useState<"rising" | "steady" | "new">(
    initialTrend ?? "steady"
  );
  const [loading, setLoading] = useState(!initialScore);

  useEffect(() => {
    if (initialScore !== undefined) return;

    async function fetchMomentum() {
      try {
        const res = await fetch(`/api/projects/${projectId}/momentum`);
        if (res.ok) {
          const data = await res.json();
          setScore(data.score);
          setTrend(data.trend);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMomentum();
  }, [projectId, initialScore]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded h-6 w-16" />
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const trendConfig = {
    rising: {
      icon: "🔥",
      label: "Rising",
      bg: "bg-gold/20",
      text: "text-gold",
    },
    steady: {
      icon: "💧",
      label: "Active",
      bg: "bg-sky/20",
      text: "text-sky",
    },
    new: {
      icon: "✨",
      label: "New",
      bg: "bg-teal/20",
      text: "text-teal",
    },
  };

  const config = trendConfig[trend];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full ${config.bg} ${config.text} ${sizeClasses[size]} font-medium`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {score > 0 && trend === "rising" && (
        <span className="opacity-75">+{Math.round(score)}</span>
      )}
    </motion.div>
  );
}
