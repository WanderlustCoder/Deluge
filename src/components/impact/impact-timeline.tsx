"use client";

import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Heart, CheckCircle, Clock, FolderOpen } from "lucide-react";
import Link from "next/link";

interface TimelineItem {
  id: string;
  type: "allocation";
  amount: number;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectStatus: string;
  date: Date;
}

interface ImpactTimelineProps {
  items: TimelineItem[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case "funded":
    case "completed":
      return <CheckCircle className="h-4 w-4 text-teal" />;
    case "active":
      return <Clock className="h-4 w-4 text-ocean" />;
    default:
      return <FolderOpen className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "funded":
      return "Funded";
    case "completed":
      return "Completed";
    case "active":
      return "In Progress";
    default:
      return status;
  }
}

export function ImpactTimeline({ items }: ImpactTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 z-10">
              <Heart className="h-4 w-4 text-gold" />
            </div>

            {/* Content */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/projects/${item.projectId}`}
                    className="font-medium text-storm dark:text-white hover:text-ocean"
                  >
                    {item.projectTitle}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-sm text-storm-light dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {item.projectCategory}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.projectStatus)}
                      <span>{getStatusLabel(item.projectStatus)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-teal">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-storm-light dark:text-gray-400">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
