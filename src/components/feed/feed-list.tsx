"use client";

import { useState, useEffect } from "react";
import { FeedItemCard } from "./feed-item-card";
import { Button } from "@/components/ui/button";
import { Bell, Check, RefreshCw } from "lucide-react";

interface FeedItem {
  id: string;
  actionType: string;
  title: string;
  description?: string;
  projectId?: string;
  communityId?: string;
  loanId?: string;
  read: boolean;
  createdAt: string;
}

interface FeedListProps {
  initialItems?: FeedItem[];
}

export function FeedList({ initialItems }: FeedListProps) {
  const [items, setItems] = useState<FeedItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function fetchFeed(pageNum: number = 1, append: boolean = false) {
    try {
      setLoading(true);
      const res = await fetch(`/api/feed?page=${pageNum}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
        }
        setUnreadCount(data.unreadCount);
        setHasMore(pageNum < data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialItems) {
      fetchFeed();
    }
  }, [initialItems]);

  async function markAllRead() {
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // Ignore
    }
  }

  async function markItemRead(itemId: string) {
    try {
      const res = await fetch(`/api/feed/${itemId}/read`, { method: "POST" });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, read: true } : item
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // Ignore
    }
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true);
  }

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-20 bg-gray-100 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-storm/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-storm">No updates yet</h3>
        <p className="text-sm text-storm-light mt-1">
          Follow projects and users to see their activity here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-ocean dark:text-white">
            Your Feed
          </h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-sky text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchFeed(1, false)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Feed items */}
      <div className="space-y-3">
        {items.map((item) => (
          <FeedItemCard
            key={item.id}
            item={item}
            onRead={() => markItemRead(item.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
