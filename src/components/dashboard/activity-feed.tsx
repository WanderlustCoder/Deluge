"use client";

import { motion } from "framer-motion";
import { Tv, Heart, Award } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface FeedItem {
  id: string;
  type: string;
  description: string;
  time: string; // ISO string (serialized from server)
}

interface ActivityFeedProps {
  items: FeedItem[];
}

function getRelativeTime(isoStr: string): string {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const iconMap: Record<string, { icon: typeof Tv; color: string; bgColor: string }> = {
  ad: { icon: Tv, color: "text-sky", bgColor: "bg-sky/10" },
  fund: { icon: Heart, color: "text-teal", bgColor: "bg-teal/10" },
  badge: { icon: Award, color: "text-gold", bgColor: "bg-gold/10" },
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-heading font-semibold text-storm">
            Recent Activity
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-storm-light text-center py-4">
            No activity yet. Watch an ad or fund a project to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-heading font-semibold text-storm">
          Recent Activity
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {items.map((item, i) => {
            const config = iconMap[item.type] || iconMap.ad;
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                {/* Timeline dot */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div
                    className={`p-1.5 rounded-lg ${config.bgColor}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  {i < items.length - 1 && (
                    <div className="absolute left-1/2 top-full w-px h-3 bg-gray-200 -translate-x-1/2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-storm leading-snug">
                    {item.description}
                  </p>
                  <p className="text-xs text-storm-light mt-0.5">
                    {getRelativeTime(item.time)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
