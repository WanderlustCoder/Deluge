"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FeedItem } from "./feed-item";
import { Activity, RefreshCw } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  endpoint: string;
  title?: string;
  limit?: number;
  showRefresh?: boolean;
  emptyMessage?: string;
}

export function ActivityFeed({
  endpoint,
  title = "Activity",
  limit = 20,
  showRefresh = true,
  emptyMessage = "No activity yet.",
}: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchActivity() {
    try {
      const res = await fetch(`${endpoint}?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchActivity().finally(() => setLoading(false));
  }, [endpoint, limit]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchActivity();
    setRefreshing(false);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-storm dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-ocean" />
            {title}
          </h3>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-storm-light hover:text-ocean transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-storm-light dark:text-gray-400 text-center py-4">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
