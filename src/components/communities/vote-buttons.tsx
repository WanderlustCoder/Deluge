"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  communityId: string;
  projectId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number; // 1, -1, or 0
}

export function VoteButtons({
  communityId,
  projectId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  async function handleVote(newVote: 1 | -1) {
    if (loading) return;

    // If clicking the same vote again, remove it (toggle)
    const voteToSend = userVote === newVote ? 0 : newVote;

    // Optimistic update
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevUserVote = userVote;

    // Calculate new counts optimistically
    let newUpvotes = upvotes;
    let newDownvotes = downvotes;

    // Remove old vote
    if (prevUserVote === 1) newUpvotes--;
    if (prevUserVote === -1) newDownvotes--;

    // Add new vote
    if (voteToSend === 1) newUpvotes++;
    if (voteToSend === -1) newDownvotes++;

    setUpvotes(newUpvotes);
    setDownvotes(newDownvotes);
    setUserVote(voteToSend);
    setLoading(true);

    try {
      const res = await fetch(`/api/communities/${communityId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, vote: voteToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
      } else {
        // Revert on error
        setUpvotes(prevUpvotes);
        setDownvotes(prevDownvotes);
        setUserVote(prevUserVote);
      }
    } catch {
      // Revert on network error
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
      setUserVote(prevUserVote);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote(1);
        }}
        disabled={loading}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors",
          userVote === 1
            ? "bg-teal/10 text-teal"
            : "text-storm-light hover:text-teal hover:bg-teal/5"
        )}
        aria-label="Upvote"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote(-1);
        }}
        disabled={loading}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors",
          userVote === -1
            ? "bg-red-100 text-red-600"
            : "text-storm-light hover:text-red-500 hover:bg-red-50"
        )}
        aria-label="Downvote"
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
