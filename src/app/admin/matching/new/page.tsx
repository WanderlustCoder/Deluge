"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

export default function NewMatchingCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [corporateName, setCorporateName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [matchRatio, setMatchRatio] = useState("2");
  const [totalBudget, setTotalBudget] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [targetValue, setTargetValue] = useState("");
  const [startsAt, setStartsAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [endsAt, setEndsAt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/matching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        corporateName,
        description,
        logoUrl: logoUrl || undefined,
        matchRatio: parseFloat(matchRatio),
        totalBudget: parseFloat(totalBudget),
        targetType,
        targetValue: targetValue || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create campaign");
      return;
    }

    toast("Matching campaign created!", "success");
    router.push("/admin/matching");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/matching"
          className="text-sm text-ocean hover:underline inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Campaigns
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-storm dark:text-white flex items-center gap-2">
          <Gift className="h-6 w-6 text-ocean" />
          Create Matching Campaign
        </h1>
        <p className="text-storm-light dark:text-gray-400 mt-1">
          Set up a new corporate matching program
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Campaign Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer 2x Match"
              required
            />

            <Input
              id="corporateName"
              label="Corporate Partner"
              value={corporateName}
              onChange={(e) => setCorporateName(e.target.value)}
              placeholder="Acme Corporation"
              required
            />

            <div className="space-y-1">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-storm dark:text-white"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the matching campaign..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
                required
              />
            </div>

            <Input
              id="logoUrl"
              label="Logo URL (optional)"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="matchRatio"
                  className="block text-sm font-medium text-storm dark:text-white"
                >
                  Match Ratio
                </label>
                <select
                  id="matchRatio"
                  value={matchRatio}
                  onChange={(e) => setMatchRatio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
                >
                  <option value="2">2x (1:1 match)</option>
                  <option value="3">3x (2:1 match)</option>
                  <option value="5">5x (4:1 match)</option>
                  <option value="10">10x (9:1 match)</option>
                </select>
              </div>

              <Input
                id="totalBudget"
                label="Total Budget ($)"
                type="number"
                min="100"
                step="100"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="10000"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="targetType"
                className="block text-sm font-medium text-storm dark:text-white"
              >
                Target
              </label>
              <select
                id="targetType"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                <option value="all">All Projects</option>
                <option value="category">Specific Category</option>
                <option value="project">Specific Project</option>
              </select>
            </div>

            {targetType !== "all" && (
              <Input
                id="targetValue"
                label={
                  targetType === "category" ? "Category Name" : "Project ID"
                }
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={
                  targetType === "category" ? "Education" : "clxx..."
                }
                required
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="startsAt"
                label="Start Date"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />

              <Input
                id="endsAt"
                label="End Date"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Create Campaign
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
