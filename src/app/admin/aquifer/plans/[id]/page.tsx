"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Target, Droplets, CheckCircle, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategicPlan {
  id: string;
  title: string;
  description: string;
  vision: string;
  fundingGoal: number;
  status: string;
  order: number;
  createdAt: string;
  flagships: Array<{
    id: string;
    status: string;
    project: {
      id: string;
      title: string;
      fundingGoal: number;
      fundingRaised: number;
    };
  }>;
}

export default function EditStrategicPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [plan, setPlan] = useState<StrategicPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    vision: "",
    fundingGoal: "",
  });

  useEffect(() => {
    fetch(`/api/aquifer/plans/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPlan(data);
        setForm({
          title: data.title,
          description: data.description,
          vision: data.vision,
          fundingGoal: data.fundingGoal.toString(),
        });
      })
      .catch(() => {
        toast("Plan not found", "error");
        router.push("/admin/aquifer/plans");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast("Title is required", "error");
      return;
    }
    if (!form.description.trim()) {
      toast("Description is required", "error");
      return;
    }
    if (!form.vision.trim()) {
      toast("Vision is required", "error");
      return;
    }
    const goal = parseFloat(form.fundingGoal);
    if (!goal || goal <= 0) {
      toast("Valid funding goal is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/aquifer/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          vision: form.vision.trim(),
          fundingGoal: goal,
        }),
      });

      if (res.ok) {
        toast("Plan updated", "success");
        router.push("/admin/aquifer/plans");
      } else {
        const result = await res.json();
        toast(result.error || "Failed to update plan", "error");
      }
    } catch {
      toast("Failed to update plan", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete() {
    if (
      !confirm(
        "Mark this plan as completed? The next queued plan will become active."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/aquifer/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });

      if (res.ok) {
        toast("Plan marked as completed", "success");
        router.push("/admin/aquifer/plans");
      } else {
        const result = await res.json();
        toast(result.error || "Failed to complete plan", "error");
      }
    } catch {
      toast("Failed to complete plan", "error");
    }
  }

  async function handleArchive() {
    if (!confirm("Archive this plan?")) {
      return;
    }

    try {
      const res = await fetch(`/api/aquifer/plans/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Plan archived", "success");
        router.push("/admin/aquifer/plans");
      } else {
        const result = await res.json();
        toast(result.error || "Failed to archive plan", "error");
      }
    } catch {
      toast("Failed to archive plan", "error");
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const statusColors: Record<string, string> = {
    active: "bg-gold",
    funded: "bg-teal",
    completed: "bg-green-500",
    archived: "bg-gray-400",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/aquifer/plans"
          className="flex items-center gap-1 text-sm text-ocean hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg">
              <Target className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
                Edit Strategic Plan
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium text-white rounded-full capitalize",
                    statusColors[plan.status] || "bg-gray-500"
                  )}
                >
                  {plan.status}
                </span>
              </div>
            </div>
          </div>

          {plan.status === "active" && (
            <Button variant="secondary" onClick={handleComplete}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-storm mb-1.5 dark:text-dark-text">
                Plan Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm mb-1.5 dark:text-dark-text">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors resize-none dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm mb-1.5 dark:text-dark-text">
                Vision *
              </label>
              <textarea
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors resize-none dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-storm mb-1.5 dark:text-dark-text">
                Funding Goal *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-light">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.fundingGoal}
                  onChange={(e) =>
                    setForm({ ...form, fundingGoal: e.target.value })
                  }
                  className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex justify-between">
              {plan.status !== "archived" && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleArchive}
                  className="text-storm-light hover:text-storm"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive Plan
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Link href="/admin/aquifer/plans">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" loading={submitting}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Attached Flagship Projects */}
      {plan.flagships.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text">
              Attached Flagship Projects
            </h3>
            <div className="space-y-3">
              {plan.flagships.map((flagship) => {
                const progress = Math.round(
                  (flagship.project.fundingRaised / flagship.project.fundingGoal) *
                    100
                );
                return (
                  <div
                    key={flagship.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-ocean" />
                      <span className="font-medium text-sm text-storm dark:text-dark-text">
                        {flagship.project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-storm-light dark:text-dark-text-secondary">
                        {progress}% funded
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium text-white rounded-full capitalize",
                          flagship.status === "funded"
                            ? "bg-green-500"
                            : flagship.status === "voting"
                              ? "bg-teal"
                              : "bg-ocean"
                        )}
                      >
                        {flagship.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
