"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { MentionInput } from "./mention-input";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface Discussion {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  user: User;
  _count?: { replies: number };
}

interface ThreadedDiscussionProps {
  discussion: Discussion;
  communityId: string;
}

export function ThreadedDiscussion({
  discussion,
  communityId,
}: ThreadedDiscussionProps) {
  const [replies, setReplies] = useState<Discussion[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const replyCount = discussion._count?.replies || 0;

  async function loadReplies() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/discussions/${discussion.id}/replies`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleReplies() {
    if (!showReplies && replies.length === 0 && replyCount > 0) {
      loadReplies();
    }
    setShowReplies(!showReplies);
  }

  async function handleSubmitReply() {
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/discussions/${discussion.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText }),
      });

      if (res.ok) {
        const data = await res.json();
        setReplies((prev) => [...prev, data.data]);
        setReplyText("");
        setReplyMode(false);
        setShowReplies(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Render mentions as links
  function renderBody(body: string) {
    const parts = body.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const username = part.slice(1);
        return (
          <a
            key={i}
            href={`/users/${username}`}
            className="text-sky hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Main discussion */}
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {discussion.user.avatarUrl ? (
            <img
              src={discussion.user.avatarUrl}
              alt={discussion.user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center text-ocean font-medium">
              {discussion.user.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ocean dark:text-white">
              {discussion.user.name}
            </span>
            <span className="text-xs text-storm-light">
              {formatDistanceToNow(new Date(discussion.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <h4 className="font-semibold mt-1">{discussion.title}</h4>
          <p className="text-storm mt-2 whitespace-pre-wrap">
            {renderBody(discussion.body)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={toggleReplies}
          className="flex items-center gap-1 text-sm text-storm hover:text-ocean transition"
        >
          {showReplies ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </button>
        <button
          onClick={() => setReplyMode(!replyMode)}
          className="flex items-center gap-1 text-sm text-storm hover:text-ocean transition"
        >
          <MessageSquare className="h-4 w-4" />
          Reply
        </button>
      </div>

      {/* Reply form */}
      {replyMode && (
        <div className="mt-4 pl-8">
          <MentionInput
            value={replyText}
            onChange={setReplyText}
            placeholder="Write a reply... Use @name to mention someone"
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handleSubmitReply}
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setReplyMode(false);
                setReplyText("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && (
        <div className="mt-4 pl-8 space-y-4">
          {loading && (
            <div className="animate-pulse h-16 bg-gray-100 rounded" />
          )}
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {reply.user.avatarUrl ? (
                  <img
                    src={reply.user.avatarUrl}
                    alt={reply.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-ocean/10 flex items-center justify-center text-ocean text-sm font-medium">
                    {reply.user.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-ocean dark:text-white">
                    {reply.user.name}
                  </span>
                  <span className="text-xs text-storm-light">
                    {formatDistanceToNow(new Date(reply.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-storm mt-1 whitespace-pre-wrap">
                  {renderBody(reply.body)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
