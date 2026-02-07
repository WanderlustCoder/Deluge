"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Target } from "lucide-react";

export default function NewStrategicPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    vision: "",
    fundingGoal: "",
  });

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
      const res = await fetch("/api/aquifer/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          vision: form.vision.trim(),
          fundingGoal: goal,
        }),
      });

      if (res.ok) {
        toast("Strategic plan created", "success");
        router.push("/admin/aquifer/plans");
      } else {
        const result = await res.json();
        toast(result.error || "Failed to create plan", "error");
      }
    } catch {
      toast("Failed to create plan", "error");
    } finally {
      setSubmitting(false);
    }
  }

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

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg">
            <Target className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
              New Strategic Plan
            </h1>
            <p className="text-storm-light dark:text-dark-text-secondary">
              Define a destination for Reserve funds
            </p>
          </div>
        </div>
      </div>

      <Card>
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
                placeholder="e.g., Solarize West Jordan"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
              />
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                A clear, memorable name for this initiative
              </p>
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
                placeholder="Brief summary of what this plan will accomplish..."
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
                placeholder="Explain the long-term impact and why this matters to the community..."
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors resize-none dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
              />
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                This is the &quot;why&quot; that users will see when viewing the
                Aquifer
              </p>
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
                  placeholder="50000"
                  className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                />
              </div>
              <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                Total Reserve funds needed to execute this plan
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3">
              <Link href="/admin/aquifer/plans">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={submitting}>
                Create Plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
