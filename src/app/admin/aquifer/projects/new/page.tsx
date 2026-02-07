"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { ArrowLeft, Droplets, Waves, Sparkles, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategicPlan {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  status: string;
}

export default function NewFlagshipPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState<StrategicPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fundingSource, setFundingSource] = useState<"reserve" | "pool">("reserve");
  const [strategicPlanId, setStrategicPlanId] = useState<string>("");

  useEffect(() => {
    fetch("/api/aquifer/plans")
      .then((r) => r.json())
      .then((data) => {
        // Only show active plans for selection
        const activePlans = data.filter(
          (p: StrategicPlan) => p.status === "active"
        );
        setPlans(activePlans);
        // Auto-select if there's only one active plan
        if (activePlans.length === 1) {
          setStrategicPlanId(activePlans[0].id);
        }
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !description || !category || !fundingGoal || !location) {
      toast("Please fill in all required fields", "error");
      return;
    }

    // Require strategic plan for Reserve-funded projects
    if (fundingSource === "reserve" && !strategicPlanId) {
      toast("Reserve-funded projects must be tied to a Strategic Plan", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/aquifer/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          fundingGoal: parseFloat(fundingGoal),
          location,
          imageUrl: imageUrl || undefined,
          fundingSource,
          strategicPlanId: fundingSource === "reserve" ? strategicPlanId : undefined,
        }),
      });

      if (res.ok) {
        toast("Flagship project created!", "success");
        router.push("/admin/aquifer");
      } else {
        const data = await res.json();
        toast(data.error || "Failed to create project", "error");
      }
    } catch {
      toast("Failed to create project", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/aquifer"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Aquifer Management
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ocean" />
            <h1 className="font-heading font-bold text-xl text-storm dark:text-dark-text">
              Create Flagship Project
            </h1>
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">
            Flagship projects are high-impact initiatives proposed by Deluge
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-storm mb-1 dark:text-dark-text">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                placeholder="Project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm mb-1 dark:text-dark-text">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                placeholder="Describe the project and its impact"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-storm mb-1 dark:text-dark-text">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                  required
                >
                  <option value="">Select category</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-storm mb-1 dark:text-dark-text">
                  Funding Goal *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-light">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={fundingGoal}
                    onChange={(e) => setFundingGoal(e.target.value)}
                    className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-storm mb-1 dark:text-dark-text">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                placeholder="e.g., Park Hill, Denver CO"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm mb-1 dark:text-dark-text">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                placeholder="https://..."
              />
            </div>

            {/* Funding Source Selection */}
            <div>
              <label className="block text-sm font-medium text-storm mb-2 dark:text-dark-text">
                Funding Source *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFundingSource("reserve")}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    fundingSource === "reserve"
                      ? "border-ocean bg-ocean/5"
                      : "border-gray-200 hover:border-gray-300 dark:border-dark-border"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets
                      className={cn(
                        "h-5 w-5",
                        fundingSource === "reserve"
                          ? "text-ocean"
                          : "text-storm-light"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        fundingSource === "reserve"
                          ? "text-ocean"
                          : "text-storm dark:text-dark-text"
                      )}
                    >
                      Reserve
                    </span>
                  </div>
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                    Direct funding by Deluge. No community vote required.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFundingSource("pool")}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    fundingSource === "pool"
                      ? "border-teal bg-teal/5"
                      : "border-gray-200 hover:border-gray-300 dark:border-dark-border"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Waves
                      className={cn(
                        "h-5 w-5",
                        fundingSource === "pool"
                          ? "text-teal"
                          : "text-storm-light"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        fundingSource === "pool"
                          ? "text-teal"
                          : "text-storm dark:text-dark-text"
                      )}
                    >
                      Pool
                    </span>
                  </div>
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                    Requires 66% community approval via Community Ripple Vote.
                  </p>
                </button>
              </div>
            </div>

            {/* Strategic Plan Selection (Reserve only) */}
            {fundingSource === "reserve" && (
              <div>
                <label className="block text-sm font-medium text-storm mb-2 dark:text-dark-text">
                  Strategic Plan *
                </label>
                {loadingPlans ? (
                  <p className="text-sm text-storm-light">Loading plans...</p>
                ) : plans.length === 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">No Active Plans</span>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">
                      Reserve-funded flagships must be tied to a Strategic Plan.
                      Create one first.
                    </p>
                    <Link href="/admin/aquifer/plans/new">
                      <Button size="sm" variant="secondary">
                        <Target className="h-4 w-4 mr-1" />
                        Create Strategic Plan
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setStrategicPlanId(plan.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 text-left transition-all",
                          strategicPlanId === plan.id
                            ? "border-gold bg-gold/5"
                            : "border-gray-200 hover:border-gray-300 dark:border-dark-border"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Target
                            className={cn(
                              "h-4 w-4",
                              strategicPlanId === plan.id
                                ? "text-gold"
                                : "text-storm-light"
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium",
                              strategicPlanId === plan.id
                                ? "text-gold"
                                : "text-storm dark:text-dark-text"
                            )}
                          >
                            {plan.title}
                          </span>
                        </div>
                        <p className="text-xs text-storm-light dark:text-dark-text-secondary ml-6">
                          Goal: $
                          {plan.fundingGoal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Link href="/admin/aquifer" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={submitting} className="flex-1">
              Create Flagship
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
