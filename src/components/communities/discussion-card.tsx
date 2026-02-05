"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, User } from "lucide-react";

interface DiscussionCardProps {
  id: string;
  communityId: string;
  title: string;
  body: string;
  userName: string;
  commentCount: number;
  createdAt: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function DiscussionCard({
  id,
  communityId,
  title,
  body,
  userName,
  commentCount,
  createdAt,
}: DiscussionCardProps) {
  const preview = body.length > 100 ? body.slice(0, 100) + "..." : body;

  return (
    <Link href={`/communities/${communityId}/discussions/${id}`}>
      <Card hover className="mb-3">
        <CardContent className="pt-4 pb-4">
          <h3 className="font-heading font-semibold text-storm mb-1">
            {title}
          </h3>
          <p className="text-sm text-storm-light mb-3">{preview}</p>
          <div className="flex items-center gap-4 text-xs text-storm-light">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {userName}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount} comment{commentCount !== 1 ? "s" : ""}
            </span>
            <span>{relativeTime(createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
