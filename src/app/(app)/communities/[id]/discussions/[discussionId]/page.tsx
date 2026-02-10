"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/i18n/formatting";
import { Spinner } from "@/components/ui/spinner";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface DiscussionDetail {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
  comments: Comment[];
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const communityId = params.id as string;
  const discussionId = params.discussionId as string;

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fetchDiscussion() {
    fetch(`/api/communities/${communityId}/discussions/${discussionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setDiscussion(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchDiscussion();
  }, [communityId, discussionId]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;

    setSubmitting(true);
    const res = await fetch(
      `/api/communities/${communityId}/discussions/${discussionId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody.trim() }),
      }
    );

    setSubmitting(false);

    if (res.ok) {
      toast("Comment added!", "success");
      setCommentBody("");
      fetchDiscussion();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to add comment", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-storm-light">Discussion not found.</p>
        <Link
          href={`/communities/${communityId}/discussions`}
          className="text-ocean hover:underline text-sm mt-2 inline-block"
        >
          Back to Discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/communities/${communityId}/discussions`}
          className="text-sm text-ocean hover:underline"
        >
          &larr; All Discussions
        </Link>
      </div>

      {/* Discussion Body */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h1 className="font-heading font-bold text-xl text-storm mb-2">
            {discussion.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-storm-light mb-4">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {discussion.user.name}
            </span>
            <span>{formatDateTime(discussion.createdAt)}</span>
          </div>
          <p className="text-storm whitespace-pre-wrap">{discussion.body}</p>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-lg text-storm mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({discussion.comments.length})
        </h2>

        {discussion.comments.length === 0 ? (
          <p className="text-storm-light text-sm py-4">
            No comments yet. Be the first to respond!
          </p>
        ) : (
          <div className="space-y-3">
            {discussion.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 text-xs text-storm-light mb-2">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium">{comment.user.name}</span>
                    <span>&middot;</span>
                    <span>{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-storm whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Comment Form */}
      <Card>
        <CardContent className="pt-5">
          <h3 className="font-heading font-semibold text-sm text-storm mb-3">
            Add a Comment
          </h3>
          <form onSubmit={handleComment} className="space-y-3">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Write your comment..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50 resize-y"
              required
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-storm-light">
                {commentBody.length}/2000
              </p>
              <Button type="submit" size="sm" loading={submitting}>
                Post Comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
