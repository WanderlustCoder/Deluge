"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Sparkles,
  Play,
  Trash2,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlagshipDetail {
  id: string;
  projectId: string;
  status: string;
  fundingSource: string;
  votingEndsAt: string | null;
  tabledAt: string | null;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    fundingRaised: number;
    backerCount: number;
    location: string;
    imageUrl: string | null;
    createdAt: string;
  };
  votes: Array<{ userId: string; vote: string; user: { name: string } }>;
  sponsors: Array<{ userId: string; user: { name: string } }>;
}

export default function AdminFlagshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [flagship, setFlagship] = useState<FlagshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fetchData() {
    fetch(`/api/aquifer/admin/${params.id}`)
      .then((r) => r.json())
      .then(setFlagship)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function handleFundFromReserve(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
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
          flagshipId: flagship?.id,
          amount,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast(
          result.data.funded
            ? "Project fully funded!"
            : `Added $${amount.toFixed(2)} from Reserve`,
          "success"
        );
        setFundAmount("");
        fetchData();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to fund", "error");
      }
    } catch {
      toast("Failed to fund", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinalize() {
    if (!confirm("Finalize voting and determine outcome?")) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/aquifer/admin/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalize" }),
      });

      if (res.ok) {
        const result = await res.json();
        toast(
          `Vote finalized: ${result.data.status} - ${result.data.reason}`,
          "success"
        );
        fetchData();
      } else {
        const result = await res.json();
        toast(result.error || "Failed to finalize", "error");
      }
    } catch {
      toast("Failed to finalize", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete flagship project "${flagship?.project.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/aquifer/admin/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Project deleted", "success");
        router.push("/admin/aquifer");
      } else {
        const result = await res.json();
        toast(result.error || "Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !flagship) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  const { project } = flagship;
  const progress = Math.round(
    (project.fundingRaised / project.fundingGoal) * 100
  );
  const remaining = project.fundingGoal - project.fundingRaised;
  const votingEnded =
    flagship.votingEndsAt && new Date(flagship.votingEndsAt) < new Date();

  const statusColors: Record<string, string> = {
    active: "bg-ocean",
    voting: "bg-teal",
    funded: "bg-green-500",
    tabled: "bg-amber-500",
    rejected: "bg-red-500",
  };

  // Vote tally
  const voteTally = { approve: 0, reject: 0, table: 0 };
  for (const v of flagship.votes) {
    if (v.vote === "approve") voteTally.approve++;
    else if (v.vote === "reject") voteTally.reject++;
    else if (v.vote === "table") voteTally.table++;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/aquifer"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Aquifer Management
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-ocean" />
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                        statusColors[flagship.status] || "bg-gray-500"
                      )}
                    >
                      {flagship.status}
                    </span>
                    <span className="text-xs text-storm-light capitalize dark:text-dark-text-secondary">
                      {flagship.fundingSource} funded
                    </span>
                  </div>
                  <h1 className="font-heading font-bold text-xl text-storm dark:text-dark-text">
                    {project.title}
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 text-sm text-storm-light mb-4 dark:text-dark-text-secondary">
                <Badge variant="ocean">{project.category}</Badge>
                <span>{project.location}</span>
                <span>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-storm whitespace-pre-wrap dark:text-dark-text-secondary">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Voting Details (for pool-funded) */}
          {flagship.fundingSource === "pool" && (
            <Card>
              <CardHeader>
                <h2 className="font-heading font-semibold text-storm flex items-center gap-2 dark:text-dark-text">
                  <Users className="h-5 w-5" />
                  Community Ripple Vote
                </h2>
              </CardHeader>
              <CardContent>
                {flagship.votingEndsAt && (
                  <p className="text-sm text-storm-light mb-4 dark:text-dark-text-secondary">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {votingEnded ? "Voting ended" : "Voting ends"}{" "}
                    {new Date(flagship.votingEndsAt).toLocaleDateString()}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600">
                      {voteTally.approve}
                    </div>
                    <div className="text-xs text-green-600/70">Approve</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg dark:bg-red-900/20">
                    <div className="text-2xl font-bold text-red-600">
                      {voteTally.reject}
                    </div>
                    <div className="text-xs text-red-600/70">Reject</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg dark:bg-amber-900/20">
                    <div className="text-2xl font-bold text-amber-600">
                      {voteTally.table}
                    </div>
                    <div className="text-xs text-amber-600/70">Table</div>
                  </div>
                </div>

                {flagship.status === "voting" && votingEnded && (
                  <Button
                    onClick={handleFinalize}
                    loading={submitting}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Finalize Vote
                  </Button>
                )}

                {flagship.votes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <h3 className="text-sm font-medium text-storm mb-2 dark:text-dark-text">
                      Votes ({flagship.votes.length})
                    </h3>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                      {flagship.votes.map((vote) => (
                        <li
                          key={vote.userId}
                          className="text-sm text-storm-light flex justify-between dark:text-dark-text-secondary"
                        >
                          <span>{vote.user.name}</span>
                          <span
                            className={cn(
                              "capitalize",
                              vote.vote === "approve" && "text-green-600",
                              vote.vote === "reject" && "text-red-500",
                              vote.vote === "table" && "text-amber-500"
                            )}
                          >
                            {vote.vote}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sponsors (for tabled) */}
          {flagship.status === "tabled" && flagship.sponsors.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-heading font-semibold text-storm dark:text-dark-text">
                  Sponsors ({flagship.sponsors.length})
                </h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {flagship.sponsors.map((sponsor) => (
                    <li
                      key={sponsor.userId}
                      className="text-sm text-storm-light dark:text-dark-text-secondary"
                    >
                      {sponsor.user.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Progress */}
          <Card>
            <CardHeader>
              <h2 className="font-heading font-semibold text-storm dark:text-dark-text">
                Funding
              </h2>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-heading font-bold text-storm dark:text-dark-text">
                  ${project.fundingRaised.toLocaleString()}
                </div>
                <div className="text-sm text-storm-light dark:text-dark-text-secondary">
                  of ${project.fundingGoal.toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden dark:bg-dark-border">
                  <div
                    className="h-full bg-gradient-to-r from-ocean to-teal"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-storm-light text-right mt-1 dark:text-dark-text-secondary">
                  {progress}%
                </div>
              </div>

              {remaining > 0 && flagship.fundingSource === "reserve" && (
                <form onSubmit={handleFundFromReserve} className="space-y-3">
                  <div className="text-sm text-storm-light mb-2 dark:text-dark-text-secondary">
                    ${remaining.toLocaleString()} remaining
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-light">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remaining}
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-300 focus:border-ocean focus:ring-2 focus:ring-ocean/20 outline-none transition-colors dark:bg-dark-elevated dark:border-dark-border dark:text-dark-text"
                      placeholder="Amount"
                    />
                  </div>
                  <Button
                    type="submit"
                    loading={submitting}
                    className="w-full"
                    size="sm"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Fund from Reserve
                  </Button>
                </form>
              )}

              {flagship.status === "funded" && (
                <div className="p-3 bg-green-50 rounded-lg text-center dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-600">
                    Fully Funded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
