"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function NewCommunityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        ...(location && { location }),
        ...(category && { category }),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create community.");
      return;
    }

    toast("Community created!", "success");
    router.push(`/communities/${data.data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/communities" className="text-sm text-ocean hover:underline">
          &larr; All Communities
        </Link>
      </div>

      <h1 className="font-heading font-bold text-2xl text-storm mb-6">
        Create a Community
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Community Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-storm">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm placeholder:text-storm-light/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              />
            </div>
            <Input
              id="location"
              label="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              id="category"
              label="Category (optional)"
              placeholder="e.g., Neighborhood, Education, Environment"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Create Community
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
