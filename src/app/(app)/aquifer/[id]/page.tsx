"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlagshipBadge } from "@/components/aquifer/flagship-badge";
import { CommunityRippleVote } from "@/components/aquifer/community-ripple-vote";
import { SponsorButton } from "@/components/aquifer/sponsor-button";
import { getCascadeStage } from "@/lib/constants";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Droplets,
  Waves,
  Check,
  Pause,
  X,
  Heart,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/i18n/formatting";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

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
  voteTally: { approve: number; reject: number; table: number; total: number };
  userVote: string | null;
}

interface VoteEligibility {
  eligible: boolean;
  reason?: string;
}

export default function FlagshipDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [flagship, setFlagship] = useState<FlagshipDetail | null>(null);
  const [eligibility, setEligibility] = useState<VoteEligibility | null>(null);
  const [watershedBalance, setWatershedBalance] = useState(0);
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [fundSuccess, setFundSuccess] = useState<string | null>(null);
  const [fundError, setFundError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  function fetchData() {
    Promise.all([
      fetch(`/api/aquifer/projects/${params.id}`).then((r) => r.json()),
      fetch(`/api/aquifer/projects/${params.id}/vote`).then((r) => r.json()),
      fetch("/api/progress").then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([flagshipData, eligibilityData, progressData]) => {
        setFlagship(flagshipData);
        setEligibility(eligibilityData);
        setWatershedBalance(progressData?.yourProgress?.watershedBalance || 0);
      })
      .finally(() => setLoading(false));
  }

  async function handleFund() {
    if (!flagship) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount < 0.25) {
      setFundError("Minimum contribution is $0.25");
      return;
    }
    if (amount > watershedBalance) {
      setFundError("Exceeds your watershed balance");
      return;
    }

    setFunding(true);
    setFundError(null);
    setFundSuccess(null);

    try {
      const res = await fetch("/api/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: flagship.projectId, amount }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFundError(data.error || "Failed to fund project");
        return;
      }

      setFundSuccess(`Contributed $${data.data.amountFunded.toFixed(2)} to this project!`);
      setFundAmount("");
      toast(`Funded $${data.data.amountFunded.toFixed(2)} to ${flagship.project.title}`, "success");

      if (data.data.stageChanged) {
        toast(`${data.data.newStageEmoji} Cascade stage: ${data.data.newStageName}!`, "success");
      }

      fetchData();
    } catch {
      setFundError("Something went wrong. Please try again.");
    } finally {
      setFunding(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading || !flagship) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const { project } = flagship;
  const cascadeStage = getCascadeStage(project.fundingRaised, project.fundingGoal);
  const progress = cascadeStage.progress * 100;

  const isSponsoring = flagship.sponsors.some(
    (s) => s.userId === session?.user?.id
  );

  // Calculate sponsors needed (10% of verified givers, min 1)
  const sponsorsNeeded = Math.max(1, Math.ceil(flagship.sponsors.length * 0.1) || 3);

  const statusConfig: Record<string, { color: string; icon: React.ComponentType<any> }> = {
    active: { color: "bg-ocean", icon: Droplets },
    voting: { color: "bg-teal", icon: Users },
    funded: { color: "bg-green-500", icon: Check },
    tabled: { color: "bg-amber-500", icon: Pause },
    rejected: { color: "bg-red-500", icon: X },
  };
  const statusInfo = statusConfig[flagship.status] || statusConfig.active;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/aquifer"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Aquifer
      </Link>

      {/* Hero */}
      {project.imageUrl && (
        <div className="h-64 mb-6 rounded-xl overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FlagshipBadge />
                    <span
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded-full",
                        statusInfo.color
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {flagship.status.charAt(0).toUpperCase() +
                        flagship.status.slice(1)}
                    </span>
                  </div>
                  <h1 className="font-heading font-bold text-2xl text-storm dark:text-dark-text">
                    {project.title}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-storm-light mb-6 dark:text-dark-text-secondary">
                <Badge variant="ocean">{project.category}</Badge>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(project.createdAt)}
                </span>
              </div>

              <p className="text-storm whitespace-pre-wrap dark:text-dark-text-secondary">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Voting (for Pool-funded projects in voting status) */}
          {flagship.fundingSource === "pool" && flagship.status === "voting" && (
            <CommunityRippleVote
              flagshipId={flagship.id}
              votingEndsAt={flagship.votingEndsAt}
              voteTally={flagship.voteTally}
              userVote={flagship.userVote as any}
              isEligible={eligibility?.eligible || false}
              eligibilityReason={eligibility?.reason}
              onVoted={fetchData}
            />
          )}

          {/* Sponsor (for tabled projects) */}
          {flagship.status === "tabled" && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text">
                  Sponsor to Reactivate
                </h3>
                <p className="text-sm text-storm-light mb-4 dark:text-dark-text-secondary">
                  This project was tabled by the community. If enough sponsors
                  support reactivation, it will return to voting.
                </p>
                <SponsorButton
                  flagshipId={flagship.id}
                  isSponsoring={isSponsoring}
                  sponsorCount={flagship.sponsors.length}
                  sponsorsNeeded={sponsorsNeeded}
                  onSponsored={fetchData}
                />
              </CardContent>
            </Card>
          )}

          {/* Funded celebration */}
          {flagship.status === "funded" && (
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 dark:from-green-900/20 dark:to-teal-900/20 dark:border-green-800">
              <CardContent className="pt-6 text-center">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-heading font-bold text-xl text-green-700 mb-2 dark:text-green-400">
                  Fully Funded!
                </h3>
                <p className="text-green-600 dark:text-green-500">
                  This flagship project has reached its funding goal and is
                  moving forward.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Progress */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="font-heading font-semibold text-storm mb-4 dark:text-dark-text">
                Funding Progress
              </h3>

              <div className="text-center mb-4">
                <div className="text-3xl font-heading font-bold text-storm dark:text-dark-text">
                  ${project.fundingRaised.toLocaleString()}
                </div>
                <div className="text-sm text-storm-light dark:text-dark-text-secondary">
                  of ${project.fundingGoal.toLocaleString()} goal
                </div>
              </div>

              <div className="mb-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden dark:bg-dark-border">
                  <div
                    className="h-full bg-gradient-to-r from-ocean to-teal transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-storm-light mt-1 dark:text-dark-text-secondary">
                  <span>{Math.round(progress)}%</span>
                  <span className="flex items-center gap-1">
                    {cascadeStage.emoji} {cascadeStage.name}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2 text-sm">
                  {flagship.fundingSource === "reserve" ? (
                    <>
                      <Droplets className="h-4 w-4 text-ocean" />
                      <span className="text-storm-light dark:text-dark-text-secondary">
                        Funded from{" "}
                        <span className="text-ocean font-medium">Reserve</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Waves className="h-4 w-4 text-teal" />
                      <span className="text-storm-light dark:text-dark-text-secondary">
                        Funded from{" "}
                        <span className="text-teal font-medium">Pool</span>{" "}
                        (community voted)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fund This Project */}
          {flagship.status === "active" && project.fundingRaised < project.fundingGoal && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text flex items-center gap-2">
                  <Heart className="h-4 w-4 text-ocean" />
                  Fund This Project
                </h3>

                <div className="text-sm text-storm-light mb-3 dark:text-dark-text-secondary">
                  Your watershed balance:{" "}
                  <span className="font-medium text-storm dark:text-dark-text">
                    ${watershedBalance.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm-light dark:text-dark-text-secondary">$</span>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max={Math.min(watershedBalance, project.fundingGoal - project.fundingRaised)}
                      value={fundAmount}
                      onChange={(e) => {
                        setFundAmount(e.target.value);
                        setFundError(null);
                        setFundSuccess(null);
                      }}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated text-storm dark:text-dark-text focus:ring-2 focus:ring-ocean focus:border-ocean outline-none"
                    />
                  </div>

                  {/* Quick amount buttons */}
                  <div className="flex gap-2">
                    {[1, 5, 10].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setFundAmount(String(Math.min(preset, watershedBalance)));
                          setFundError(null);
                          setFundSuccess(null);
                        }}
                        disabled={watershedBalance < 0.25}
                        className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                      >
                        ${preset}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        const remaining = project.fundingGoal - project.fundingRaised;
                        setFundAmount(String(Math.min(watershedBalance, remaining)));
                        setFundError(null);
                        setFundSuccess(null);
                      }}
                      disabled={watershedBalance < 0.25}
                      className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-dark-border text-storm-light dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                    >
                      Max
                    </button>
                  </div>

                  <Button
                    onClick={handleFund}
                    disabled={funding || !fundAmount || watershedBalance < 0.25}
                    className="w-full"
                  >
                    {funding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Heart className="h-4 w-4 mr-2" />
                    )}
                    {funding ? "Funding..." : "Fund Project"}
                  </Button>

                  {fundError && (
                    <p className="text-xs text-red-500">{fundError}</p>
                  )}
                  {fundSuccess && (
                    <p className="text-xs text-green-600 dark:text-green-400">{fundSuccess}</p>
                  )}

                  {watershedBalance < 0.25 && (
                    <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                      <Link href="/watch" className="text-ocean hover:underline">
                        Watch ads
                      </Link>{" "}
                      to build your watershed balance.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sponsors List (for tabled) */}
          {flagship.status === "tabled" && flagship.sponsors.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-heading font-semibold text-storm mb-3 dark:text-dark-text">
                  Sponsors
                </h3>
                <ul className="space-y-2">
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
      </div>
    </div>
  );
}
