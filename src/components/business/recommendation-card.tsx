"use client";

import { formatDistanceToNow } from "date-fns";

interface RecommendationCardProps {
  userName: string;
  note: string;
  createdAt: string | Date;
}

export function RecommendationCard({
  userName,
  note,
  createdAt,
}: RecommendationCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <p className="text-gray-700 dark:text-gray-300">{note}</p>
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
        <span>— {userName}</span>
        <span>
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
