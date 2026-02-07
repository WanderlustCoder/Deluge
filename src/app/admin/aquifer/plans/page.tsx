"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Edit,
  Target,
  CheckCircle,
  Archive,
  Play,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
    project: { title: string; fundingRaised: number };
  }>;
}

export default function AdminStrategicPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<StrategicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  function fetchPlans() {
    fetch(`/api/aquifer/plans?includeArchived=${showArchived}`)
      .then((r) => r.json())
      .then(setPlans)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchPlans();
  }, [showArchived]);

  async function handleComplete(planId: string) {
    if (
      !confirm(
        "Mark this plan as completed? The next queued plan will become active."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/aquifer/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });

      if (res.ok) {
        toast("Plan marked as completed", "success");
        fetchPlans();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to complete plan", "error");
      }
    } catch {
      toast("Failed to complete plan", "error");
    }
  }

  async function handleArchive(planId: string) {
    if (!confirm("Archive this plan? It will no longer be visible to users.")) {
      return;
    }

    try {
      const res = await fetch(`/api/aquifer/plans/${planId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Plan archived", "success");
        fetchPlans();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to archive plan", "error");
      }
    } catch {
      toast("Failed to archive plan", "error");
    }
  }

  const statusColors: Record<string, string> = {
    active: "bg-gold text-white",
    funded: "bg-teal text-white",
    completed: "bg-green-500 text-white",
    archived: "bg-gray-400 text-white",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    active: <Target className="h-4 w-4" />,
    funded: <CheckCircle className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    archived: <Archive className="h-4 w-4" />,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  const activePlan = plans.find((p) => p.status === "active");
  const queuedPlans = plans.filter((p) => p.status === "funded" && p.id !== activePlan?.id);
  const completedPlans = plans.filter((p) => p.status === "completed");
  const archivedPlans = plans.filter((p) => p.status === "archived");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
            Strategic Plans
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary">
            Reserve funds are always tied to a strategic plan
          </p>
        </div>
        <Link href="/admin/aquifer/plans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </Link>
      </div>

      {/* Active Plan */}
      {activePlan && (
        <Card className="border-l-4 border-l-gold">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
                    statusColors[activePlan.status]
                  )}
                >
                  {statusIcons[activePlan.status]}
                  Active
                </span>
                <h2 className="font-heading font-semibold text-lg text-storm dark:text-dark-text">
                  {activePlan.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/aquifer/plans/${activePlan.id}`}>
                  <Button variant="secondary" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleComplete(activePlan.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-3">
              {activePlan.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-storm dark:text-dark-text">
                Goal:{" "}
                <strong>
                  ${activePlan.fundingGoal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
              </span>
              <span className="text-storm-light dark:text-dark-text-secondary">
                {activePlan.flagships.length} flagship project
                {activePlan.flagships.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {!activePlan && (
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-5">
            <p className="text-storm-light dark:text-dark-text-secondary">
              No active strategic plan. Create one to give Reserve funds a
              destination.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Queued Plans */}
      {queuedPlans.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text">
            Queued Plans
          </h3>
          <div className="space-y-3">
            {queuedPlans.map((plan, index) => (
              <Card key={plan.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-dark-border rounded-full text-xs font-medium text-storm-light dark:text-dark-text-secondary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-storm dark:text-dark-text">
                          {plan.title}
                        </p>
                        <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                          Goal: $
                          {plan.fundingGoal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/aquifer/plans/${plan.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Plans */}
      {completedPlans.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text">
            Completed Plans
          </h3>
          <div className="space-y-3">
            {completedPlans.map((plan) => (
              <Card key={plan.id} className="opacity-75">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-storm dark:text-dark-text">
                          {plan.title}
                        </p>
                        <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                          ${plan.fundingGoal.toLocaleString()} &bull;{" "}
                          {plan.flagships.length} project
                          {plan.flagships.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/aquifer/plans/${plan.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(plan.id)}
                        className="text-storm-light hover:text-storm"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show Archived Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showArchived"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label
          htmlFor="showArchived"
          className="text-sm text-storm-light dark:text-dark-text-secondary cursor-pointer"
        >
          Show archived plans
        </label>
      </div>

      {showArchived && archivedPlans.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text">
            Archived Plans
          </h3>
          <div className="space-y-3">
            {archivedPlans.map((plan) => (
              <Card key={plan.id} className="opacity-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Archive className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-storm dark:text-dark-text">
                        {plan.title}
                      </p>
                      <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                        Archived
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
