"use client";

import { formatDistanceToNow } from "date-fns";
import {
  UserPlus,
  Tv,
  HandCoins,
  DollarSign,
  Gift,
  Droplet,
  CheckCircle,
  Target,
  Users,
  Newspaper,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface FeedItemProps {
  item: ActivityItem;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  signup: { icon: UserPlus, color: "text-teal" },
  ad: { icon: Tv, color: "text-sky" },
  loan: { icon: HandCoins, color: "text-gold" },
  contribution: { icon: DollarSign, color: "text-ocean" },
  referral: { icon: Gift, color: "text-purple-500" },
  cascade: { icon: Droplet, color: "text-ocean" },
  loan_funded: { icon: CheckCircle, color: "text-teal" },
  milestone: { icon: Target, color: "text-gold" },
  community_join: { icon: Users, color: "text-teal" },
  project_update: { icon: Newspaper, color: "text-ocean" },
  // Community-aggregated types
  community_funding: { icon: DollarSign, color: "text-teal" },
  community_growth: { icon: Users, color: "text-sky" },
  community_project_milestone: { icon: Target, color: "text-gold" },
  community_goal_progress: { icon: Target, color: "text-ocean" },
};

export function FeedItem({ item }: FeedItemProps) {
  const config = typeConfig[item.type] || { icon: Droplet, color: "text-storm-light" };
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${config.color}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-storm dark:text-gray-300 leading-snug">
          {item.message}
        </p>
        <p className="text-xs text-storm-light dark:text-gray-500 mt-0.5">
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
