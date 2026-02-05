"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiscussionCard } from "@/components/communities/discussion-card";
import { useToast } from "@/components/ui/toast";
import { ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

interface Discussion {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string };
  _count: { comments: number };
}

export default function DiscussionsPage() {
  const params = useParams();
  const { toast } = useToast();
  const communityId = params.id as string;

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fetchDiscussions() {
    fetch(`/api/communities/${communityId}/discussions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDiscussions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchDiscussions();
  }, [communityId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    const res = await fetch(`/api/communities/${communityId}/discussions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body: body.trim() }),
    });

    setSubmitting(false);

    if (res.ok) {
      toast("Discussion created!", "success");
      setTitle("");
      setBody("");
      setFormOpen(false);
      fetchDiscussions();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to create discussion", "error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/communities/${communityId}`}
          className="text-sm text-ocean hover:underline"
        >
          &larr; Back to Community
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-storm">
          Discussions
        </h1>
        <Button
          size="sm"
          variant={formOpen ? "outline" : "primary"}
          onClick={() => setFormOpen(!formOpen)}
        >
          {formOpen ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <MessageSquarePlus className="h-4 w-4 mr-1" />
              New Discussion
            </>
          )}
        </Button>
      </div>

      {/* New Discussion Form */}
      {formOpen && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="discussion-title"
                  className="block text-sm font-medium text-storm mb-1"
                >
                  Title
                </label>
                <input
                  id="discussion-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="What would you like to discuss?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  required
                />
                <p className="text-xs text-storm-light mt-1">
                  {title.length}/200
                </p>
              </div>
              <div>
                <label
                  htmlFor="discussion-body"
                  className="block text-sm font-medium text-storm mb-1"
                >
                  Body
                </label>
                <textarea
                  id="discussion-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50 resize-y"
                  required
                />
                <p className="text-xs text-storm-light mt-1">
                  {body.length}/5000
                </p>
              </div>
              <Button type="submit" size="sm" loading={submitting}>
                Post Discussion
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Discussion List */}
      {loading ? (
        <p className="text-center text-storm-light py-8">Loading...</p>
      ) : discussions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquarePlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-storm-light">
            No discussions yet. Start the conversation!
          </p>
        </div>
      ) : (
        discussions.map((d) => (
          <DiscussionCard
            key={d.id}
            id={d.id}
            communityId={communityId}
            title={d.title}
            body={d.body}
            userName={d.user.name}
            commentCount={d._count.comments}
            createdAt={d.createdAt}
          />
        ))
      )}
    </div>
  );
}
