"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Droplets,
  Waves,
  Plus,
  DollarSign,
  ArrowRight,
  Edit,
  Trash2,
  Play,
  Target,
  Map,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/i18n/formatting";

interface StrategicPlan {
  id: string;
  title: string;
  description: string;
  vision: string;
  fundingGoal: number;
  status: string;
  order: number;
  createdAt: string;
  flagships: Array<{ id: string; project: { title: string } }>;
}

interface AdminData {
  funds: {
    reserve: { balance: number };
    pool: { balance: number };
  };
  flagships: Array<{
    id: string;
    status: string;
    fundingSource: string;
    votingEndsAt: string | null;
    strategicPlanId: string | null;
    project: {
      id: string;
      title: string;
      category: string;
      fundingGoal: number;
      fundingRaised: number;
    };
    _count: { votes: number; sponsors: number };
  }>;
  recentContributions: Array<{
    id: string;
    amount: number;
    isDeluge: boolean;
    note: string | null;
    createdAt: string;
    user: { name: string; email: string } | null;
    aquifer: { type: string };
  }>;
  strategicPlans: StrategicPlan[];
  activePlan: StrategicPlan | null;
}

export default function AdminAquiferPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  // Add funds form
  const [addFundsType, setAddFundsType] = useState<"reserve" | "pool">("reserve");
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [addFundsNote, setAddFundsNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fetchData() {
    fetch("/api/aquifer/admin")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAddFunds(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(addFundsAmount);
    if (!amount || amount <= 0) {
      toast("Enter a valid amount", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/aquifer/admin/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: addFundsType,
          amount,
          note: addFundsNote || undefined,
        }),
      });

      if (res.ok) {
        toast(
          `Added $${amount.toFixed(2)} to ${addFundsType === "reserve" ? "Reserve" : "Pool"}`,
          "success"
        );
        setAddFundsAmount("");
        setAddFundsNote("");
        fetchData();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to add funds", "error");
      }
    } catch {
      toast("Failed to add funds", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(flagshipId: string, title: string) {
    if (!confirm(`Delete flagship project "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/aquifer/admin/${flagshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Project deleted", "success");
        fetchData();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete", "error");
    }
  }

  async function handleFinalize(flagshipId: string) {
    if (!confirm("Finalize voting and determine outcome?")) {
      return;
    }

    try {
      const res = await fetch(`/api/aquifer/admin/${flagshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalize" }),
      });

      if (res.ok) {
        const result = await res.json();
        toast(`Vote finalized: ${result.data.status} - ${result.data.reason}`, "success");
        fetchData();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to finalize", "error");
      }
    } catch {
      toast("Failed to finalize", "error");
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load data</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-ocean",
    voting: "bg-teal",
    funded: "bg-green-500",
    tabled: "bg-amber-500",
    rejected: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
            Aquifer Management
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary">
            Manage flagship project funding
          </p>
        </div>
        <Link href="/admin/aquifer/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Flagship
          </Button>
        </Link>
      </div>

      {/* Fund Balances */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-5 w-5 text-ocean" />
              <h3 className="font-heading font-semibold text-storm dark:text-dark-text">
                Reserve
              </h3>
            </div>
            <p className="text-3xl font-heading font-bold text-storm dark:text-dark-text">
              ${data.funds.reserve.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="h-5 w-5 text-teal" />
              <h3 className="font-heading font-semibold text-storm dark:text-dark-text">
                Pool
              </h3>
            </div>
            <p className="text-3xl font-heading font-bold text-storm dark:text-dark-text">
              ${data.funds.pool.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Strategic Plan */}
      {data.activePlan && (
        <Card className="border-l-4 border-l-gold">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-5 w-5 text-gold" />
                  <h3 className="font-heading font-semibold text-storm dark:text-dark-text">
                    Active Strategic Plan
                  </h3>
                </div>
                <p className="font-medium text-lg text-storm dark:text-dark-text mb-1">
                  {data.activePlan.title}
                </p>
                <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-3">
                  {data.activePlan.description}
                </p>

                {/* Progress toward goal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-storm-light dark:text-dark-text-secondary">
                      Reserve progress
                    </span>
                    <span className="font-medium text-storm dark:text-dark-text">
                      ${data.funds.reserve.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      / ${data.activePlan.fundingGoal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (data.funds.reserve.balance / data.activePlan.fundingGoal) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                    {Math.round(
                      (data.funds.reserve.balance / data.activePlan.fundingGoal) * 100
                    )}
                    % funded &bull; {data.activePlan.flagships.length} flagship project
                    {data.activePlan.flagships.length !== 1 ? "s" : ""} attached
                  </p>
                </div>
              </div>
              <Link href="/admin/aquifer/plans">
                <Button variant="secondary" size="sm">
                  <Map className="h-4 w-4 mr-1" />
                  Manage Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!data.activePlan && (
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-storm dark:text-dark-text mb-1">
                  No Active Strategic Plan
                </p>
                <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                  Create a strategic plan to give Reserve funds a destination.
                </p>
              </div>
              <Link href="/admin/aquifer/plans/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Funds Form */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-storm flex items-center gap-2 dark:text-dark-text">
            <DollarSign className="h-5 w-5" />
            Add Funds
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFunds} className="flex flex-wrap gap-4">
            <select
              value={addFundsType}
              onChange={(e) =>
                setAddFundsType(e.target.value as "reserve" | "pool")
              }
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-storm focus:outline-none focus:ring-2 focus:ring-ocean/50 dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
            >
              <option value="reserve">Reserve</option>
              <option value="pool">Pool</option>
            </select>

            <div className="relative flex-1 min-w-[150px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-light">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                placeholder="Amount"
                className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
              />
            </div>

            <input
              type="text"
              value={addFundsNote}
              onChange={(e) => setAddFundsNote(e.target.value)}
              placeholder="Note (optional)"
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
            />

            <Button type="submit" loading={submitting}>
              Add Funds
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Flagship Projects Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-heading font-semibold text-storm dark:text-dark-text">
            Flagship Projects
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Source
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Funding
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Votes
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.flagships.map((flagship) => {
                  const progress = Math.round(
                    (flagship.project.fundingRaised /
                      flagship.project.fundingGoal) *
                      100
                  );
                  const votingEnded =
                    flagship.votingEndsAt &&
                    new Date(flagship.votingEndsAt) < new Date();

                  return (
                    <tr
                      key={flagship.id}
                      className="border-b border-gray-50 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-border/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/aquifer/projects/${flagship.id}`}
                          className="font-medium text-storm hover:text-ocean dark:text-dark-text"
                        >
                          {flagship.project.title}
                        </Link>
                        <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                          {flagship.project.category}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                            statusColors[flagship.status] || "bg-gray-500"
                          )}
                        >
                          {flagship.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize text-sm text-storm-light dark:text-dark-text-secondary">
                        {flagship.fundingSource}
                      </td>
                      <td className="px-6 py-4 text-sm text-storm dark:text-dark-text">
                        ${flagship.project.fundingRaised.toLocaleString()} /{" "}
                        ${flagship.project.fundingGoal.toLocaleString()}{" "}
                        <span className="text-storm-light dark:text-dark-text-secondary">
                          ({progress}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-storm-light dark:text-dark-text-secondary">
                        {flagship._count.votes} vote
                        {flagship._count.votes !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {flagship.status === "voting" && votingEnded && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleFinalize(flagship.id)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Finalize
                            </Button>
                          )}
                          <Link
                            href={`/admin/aquifer/projects/${flagship.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(flagship.id, flagship.project.title)
                            }
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.flagships.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-storm-light dark:text-dark-text-secondary"
                    >
                      No flagship projects yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contributions */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-semibold text-storm dark:text-dark-text">
            Recent Contributions
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Contributor
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Fund
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-storm-light dark:text-dark-text-secondary">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentContributions.map((contribution) => (
                  <tr
                    key={contribution.id}
                    className="border-b border-gray-50 dark:border-dark-border"
                  >
                    <td className="px-6 py-3 text-sm text-storm-light dark:text-dark-text-secondary">
                      {formatDate(contribution.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-sm text-storm dark:text-dark-text">
                      {contribution.isDeluge ? (
                        <Badge variant="ocean">Deluge</Badge>
                      ) : (
                        contribution.user?.name || "Unknown"
                      )}
                    </td>
                    <td className="px-6 py-3 capitalize text-sm text-storm-light dark:text-dark-text-secondary">
                      {contribution.aquifer.type}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-storm dark:text-dark-text">
                      ${contribution.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm text-storm-light dark:text-dark-text-secondary">
                      {contribution.note || "-"}
                    </td>
                  </tr>
                ))}
                {data.recentContributions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-storm-light dark:text-dark-text-secondary"
                    >
                      No contributions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
