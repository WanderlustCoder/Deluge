"use client";

import { Droplets, Waves, Target } from "lucide-react";

interface ActivePlan {
  id: string;
  title: string;
  description: string;
  vision: string;
  fundingGoal: number;
  status: string;
}

interface AquiferHeroProps {
  reserveBalance?: number;
  reserveFundingGoal?: number;
  reserveProgress?: number;
  poolBalance?: number;
  activePlan?: ActivePlan | null;
}

export function AquiferHero({
  reserveBalance,
  reserveFundingGoal,
  reserveProgress,
  poolBalance,
  activePlan,
}: AquiferHeroProps) {
  const progressPercent = Math.round((reserveProgress || 0) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean via-ocean-light to-teal p-8 mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="waves" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M0 5 Q 5 0, 10 5 T 20 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#waves)" />
        </svg>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-3xl text-white">
              The Aquifer
            </h1>
            <p className="text-white/80 text-lg">
              Deluge Flagship Projects
            </p>
          </div>
        </div>

        <p className="text-white/90 max-w-2xl mb-6">
          The Aquifer funds transformative flagship projects proposed by Deluge.
          These are high-impact initiatives that align with our mission to create
          systemic change through community giving.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Reserve Fund with Strategic Plan Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="h-4 w-4 text-white/80" />
              <span className="text-white/80 text-sm font-medium">Reserve</span>
            </div>
            <p className="text-white text-2xl font-heading font-bold">
              ${(reserveBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              {reserveFundingGoal ? (
                <span className="text-white/60 text-lg font-normal">
                  {" / $"}
                  {reserveFundingGoal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              ) : null}
            </p>

            {activePlan ? (
              <div className="mt-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="h-3 w-3 text-gold" />
                  <span className="text-white/80 text-xs">
                    Building toward:{" "}
                    <span className="text-white font-medium">{activePlan.title}</span>
                  </span>
                </div>
                <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">
                  {progressPercent}% funded
                </p>
              </div>
            ) : (
              <p className="text-white/60 text-xs mt-1">Deluge-directed funding</p>
            )}
          </div>

          {/* Pool Fund */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Waves className="h-4 w-4 text-white/80" />
              <span className="text-white/80 text-sm font-medium">Pool</span>
            </div>
            <p className="text-white text-2xl font-heading font-bold">
              ${(poolBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-white/60 text-xs mt-1">Community-voted funding</p>
          </div>
        </div>
      </div>
    </div>
  );
}
