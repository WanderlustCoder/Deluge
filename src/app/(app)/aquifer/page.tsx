"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AquiferHero } from "@/components/aquifer/aquifer-hero";
import { FundCard } from "@/components/aquifer/fund-card";
import { FlagshipProjectCard } from "@/components/aquifer/flagship-project-card";
import { ContributeModal } from "@/components/aquifer/contribute-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, Pause, ArrowRight } from "lucide-react";

interface ActivePlan {
  id: string;
  title: string;
  description: string;
  vision: string;
  fundingGoal: number;
  status: string;
}

interface FundsData {
  reserve: {
    balance: number;
    fundingGoal: number;
    progress: number;
  };
  pool: { balance: number; userContribution: number };
  activePlan: ActivePlan | null;
}

interface FlagshipProject {
  id: string;
  projectId: string;
  status: string;
  fundingSource: string;
  votingEndsAt: string | null;
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
  };
  voteTally: {
    approve: number;
    reject: number;
    table: number;
    total: number;
  };
  userVote: string | null;
}

export default function AquiferPage() {
  const { data: session } = useSession();
  const [funds, setFunds] = useState<FundsData | null>(null);
  const [flagships, setFlagships] = useState<FlagshipProject[]>([]);
  const [watershed, setWatershed] = useState<number>(0);
  const [showContribute, setShowContribute] = useState(false);
  const [loading, setLoading] = useState(true);

  function fetchData() {
    setLoading(true);
    Promise.all([
      fetch("/api/aquifer").then((r) => r.json()),
      fetch("/api/aquifer/projects").then((r) => r.json()),
      fetch("/api/progress").then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([fundsData, flagshipsData, progressData]) => {
        setFunds(fundsData);
        setFlagships(Array.isArray(flagshipsData) ? flagshipsData : []);
        setWatershed(progressData?.yourProgress?.watershedBalance || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const activeProjects = flagships.filter(
    (f) => f.status === "active" || f.status === "voting"
  );
  const tabledCount = flagships.filter((f) => f.status === "tabled").length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light dark:text-dark-text-secondary">
          Loading Aquifer...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AquiferHero
        reserveBalance={funds?.reserve.balance}
        reserveFundingGoal={funds?.reserve.fundingGoal}
        reserveProgress={funds?.reserve.progress}
        poolBalance={funds?.pool.balance}
        activePlan={funds?.activePlan}
      />

      {/* Fund Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FundCard
          type="reserve"
          balance={funds?.reserve.balance || 0}
          planTitle={funds?.activePlan?.title}
          fundingGoal={funds?.reserve.fundingGoal}
          progress={funds?.reserve.progress}
        />
        <div className="space-y-4">
          <FundCard
            type="pool"
            balance={funds?.pool.balance || 0}
            userContribution={funds?.pool.userContribution}
          />
          <Button
            variant="secondary"
            onClick={() => setShowContribute(true)}
            className="w-full"
          >
            <Waves className="h-4 w-4 mr-2" />
            Contribute to Pool
          </Button>
        </div>
      </div>

      {/* Active Flagship Projects */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-xl text-storm dark:text-dark-text">
            Flagship Projects
          </h2>
          {tabledCount > 0 && (
            <Link
              href="/aquifer/considered"
              className="flex items-center gap-1 text-sm text-ocean hover:underline"
            >
              <Pause className="h-4 w-4" />
              {tabledCount} tabled project{tabledCount !== 1 ? "s" : ""}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {activeProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((flagship) => (
              <FlagshipProjectCard
                key={flagship.id}
                id={flagship.id}
                project={flagship.project}
                status={flagship.status}
                fundingSource={flagship.fundingSource}
                votingEndsAt={flagship.votingEndsAt}
                voteTally={flagship.voteTally}
                userVote={flagship.userVote}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Waves className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-storm mb-2 dark:text-dark-text">
                No Active Flagship Projects
              </h3>
              <p className="text-storm-light dark:text-dark-text-secondary">
                Check back soon for new Deluge flagship initiatives.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* About the Aquifer */}
      <section>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-heading font-semibold text-lg text-storm mb-3 dark:text-dark-text">
              How the Aquifer Works
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-storm-light dark:text-dark-text-secondary">
              <div>
                <h4 className="font-medium text-storm mb-2 dark:text-dark-text">
                  Reserve Fund
                </h4>
                <p>
                  The Reserve is funded by Deluge and used to directly fund
                  flagship projects that align with our strategic priorities.
                  These projects are hand-selected for maximum impact.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-storm mb-2 dark:text-dark-text">
                  Pool Fund
                </h4>
                <p>
                  The Pool is funded by community contributions and requires a
                  Community Ripple Vote before funds are deployed. Verified
                  Givers can vote to approve, reject, or table Pool-funded
                  projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {showContribute && (
        <ContributeModal
          currentBalance={watershed}
          onClose={() => setShowContribute(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
