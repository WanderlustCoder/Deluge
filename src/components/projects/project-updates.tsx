"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatDistanceToNow } from "date-fns";
import { Newspaper, Plus, X } from "lucide-react";

interface ProjectUpdate {
  id: string;
  title: string;
  body: string;
  imageUrls: string[] | null;
  createdAt: string;
}

interface ProjectUpdatesProps {
  projectId: string;
  isAdmin: boolean;
}

export function ProjectUpdates({ projectId, isAdmin }: ProjectUpdatesProps) {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/updates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUpdates(data);
        }
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  function addImageUrl() {
    setImageUrls([...imageUrls, ""]);
  }

  function removeImageUrl(index: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  }

  function updateImageUrl(index: number, value: string) {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    const validImageUrls = imageUrls.filter((url) => url.trim());

    const res = await fetch(`/api/projects/${projectId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        imageUrls: validImageUrls.length > 0 ? validImageUrls : undefined,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast(data.error || "Failed to post update", "error");
      return;
    }

    toast("Update posted!", "success");
    setUpdates([data.data, ...updates]);
    setShowForm(false);
    setTitle("");
    setBody("");
    setImageUrls([]);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-storm dark:text-white flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-ocean" />
            Updates
            {updates.length > 0 && (
              <span className="text-sm font-normal text-storm-light dark:text-gray-400">
                ({updates.length})
              </span>
            )}
          </h3>
          {isAdmin && !showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Post Update
            </Button>
          )}
        </div>

        {/* Post Update Form (Admin) */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-storm dark:text-white">
                New Update
              </h4>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-storm-light hover:text-storm dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Input
                id="update-title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Update title"
                required
              />

              <div>
                <label
                  htmlFor="update-body"
                  className="block text-sm font-medium text-storm dark:text-white mb-1"
                >
                  Content
                </label>
                <textarea
                  id="update-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Share project progress, milestones, or news..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
                  required
                />
              </div>

              {/* Image URLs */}
              {imageUrls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-storm dark:text-white mb-1">
                    Image URLs (optional)
                  </label>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        id={`image-${index}`}
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImageUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </Button>

              <Button type="submit" loading={submitting} className="w-full">
                Post Update
              </Button>
            </div>
          </form>
        )}

        {/* Updates List */}
        {loading ? (
          <p className="text-sm text-storm-light dark:text-gray-400 text-center py-4">
            Loading updates...
          </p>
        ) : updates.length === 0 ? (
          <p className="text-sm text-storm-light dark:text-gray-400 text-center py-4">
            No updates yet.
          </p>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="border-l-4 border-ocean pl-4 py-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-storm dark:text-white">
                    {update.title}
                  </h4>
                  <span className="text-xs text-storm-light dark:text-gray-400">
                    {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-storm-light dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {update.body}
                </p>
                {update.imageUrls && update.imageUrls.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {update.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Update image ${index + 1}`}
                        className="h-24 w-auto rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
