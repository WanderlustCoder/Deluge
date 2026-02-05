"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import type { Project } from "@prisma/client";

interface ProjectFormProps {
  initialData?: Project;
  mode: "create" | "edit";
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? PROJECT_CATEGORIES[0]);
  const [fundingGoal, setFundingGoal] = useState(initialData?.fundingGoal?.toString() ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "active");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      title,
      description,
      category,
      fundingGoal: parseFloat(fundingGoal),
      location,
      status,
      imageUrl: imageUrl || null,
    };

    const url =
      mode === "create"
        ? "/api/admin/projects"
        : `/api/admin/projects/${initialData!.id}`;

    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    toast(mode === "create" ? "Project created" : "Project updated", "success");
    router.push("/admin");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              rows={4}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm placeholder:text-storm-light/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="category" className="block text-sm font-medium text-storm">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
            >
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="fundingGoal"
            label="Funding Goal ($)"
            type="number"
            step="0.01"
            min="1"
            value={fundingGoal}
            onChange={(e) => setFundingGoal(e.target.value)}
            required
          />
          <Input
            id="location"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          {mode === "edit" && (
            <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-storm">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                <option value="active">Active</option>
                <option value="funded">Funded</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          <Input
            id="imageUrl"
            label="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
