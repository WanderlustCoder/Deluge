"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Sun,
  Zap,
  Gauge,
  Leaf,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
} from "lucide-react";
import { EFFICIENCY_UPGRADE_LABELS, EFFICIENCY_PHASES, type EfficiencyUpgradeCategory } from "@/lib/constants";

interface PhaseData {
  id: string;
  phaseNumber: number;
  phaseName: string;
  categories: string;
  estimatedCost: number;
  actualCost: number | null;
  amountFunded: number;
  fundingComplete: boolean;
  gapAmount: number | null;
  gapFunded: number;
  status: string;
  contractorName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  project: { id: string; title: string; fundingGoal: number; fundingRaised: number; status: string } | null;
}

interface HomeDetail {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  homeType: string;
  yearBuilt: number | null;
  squareFootage: number | null;
  ownershipStatus: string;
  status: string;
  entryTrack: string;
  currentEnergyBill: number | null;
  energyScoreBefore: number | null;
  energyScoreAfter: number | null;
  createdAt: string;
  assessedAt: string | null;
  completedAt: string | null;
  assessment: {
    efficiencyScore: number | null;
    totalEstimatedCost: number;
    projectedSavingsKwh: number | null;
    projectedSavingsDollars: number | null;
    projectedCo2Reduction: number | null;
    upgradePlan: string | null;
    insulationCondition: string | null;
    windowType: string | null;
    hvacAge: number | null;
    hvacType: string | null;
    waterHeaterType: string | null;
    roofCondition: string | null;
    electricalPanelAmps: number | null;
    assessorNotes: string | null;
  } | null;
  phases: PhaseData[];
  neighborhoodBatch: { id: string; name: string; status: string; homeCount: number } | null;
}

const PHASE_STATUS_ICONS: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  verified: CheckCircle,
  in_progress: Loader2,
  funded: DollarSign,
  funding: Clock,
  pending: Clock,
};

const PHASE_STATUS_COLORS: Record<string, string> = {
  completed: "text-green-500",
  verified: "text-green-500",
  in_progress: "text-[#FFA000]",
  funded: "text-[#42A5F5]",
  funding: "text-[#42A5F5]",
  pending: "text-gray-400",
};

export default function EfficiencyDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const { id } = useParams<{ id: string }>();
  const [home, setHome] = useState<HomeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  if (authStatus === "unauthenticated") redirect("/login");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/efficiency/applications/${id}`);
      const data = await res.json();
      if (data.home) setHome(data.home);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (authStatus === "authenticated") fetchData();
  }, [authStatus, fetchData]);

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    setWithdrawing(true);
    try {
      const res = await fetch(`/api/efficiency/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      const data = await res.json();
      if (data.success) fetchData();
    } catch {
      // Handle error
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  if (!home) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">Application not found.</p>
        <Link href="/efficiency" className="text-[#0D47A1] hover:underline text-sm mt-2 inline-block">Back to Efficiency</Link>
      </div>
    );
  }

  const upgradePlan = home.assessment?.upgradePlan ? JSON.parse(home.assessment.upgradePlan) as Array<{ category: EfficiencyUpgradeCategory; priority: number; needed: boolean; notes?: string }> : [];
  const totalEstimated = home.phases.reduce((s, p) => s + p.estimatedCost, 0);
  const totalFunded = home.phases.reduce((s, p) => s + p.amountFunded, 0);
  const completedPhases = home.phases.filter(p => p.status === "completed" || p.status === "verified").length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/efficiency" className="text-sm text-[#0D47A1] hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Efficiency
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFA000]/10 text-[#FFA000] flex items-center justify-center">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white">{home.address}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{home.city}, {home.state} {home.zipCode}</p>
            </div>
          </div>
          {["applied", "assessment_queued", "assessed"].includes(home.status) && (
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              {withdrawing ? "Withdrawing..." : "Withdraw"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {home.assessment && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <Gauge className="h-4 w-4 text-[#0D47A1] mb-1" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{home.assessment.efficiencyScore}/100</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Efficiency Score</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <DollarSign className="h-4 w-4 text-[#00897B] mb-1" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">${totalEstimated.toLocaleString()}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Estimated</div>
            </div>
            {home.assessment.projectedSavingsKwh && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                <Zap className="h-4 w-4 text-[#FFA000] mb-1" />
                <div className="text-xl font-bold text-gray-900 dark:text-white">{home.assessment.projectedSavingsKwh.toLocaleString()}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">kWh Saved/Year</div>
              </div>
            )}
            {home.assessment.projectedCo2Reduction && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                <Leaf className="h-4 w-4 text-green-600 mb-1" />
                <div className="text-xl font-bold text-gray-900 dark:text-white">{home.assessment.projectedCo2Reduction}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tons CO2/Year</div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Upgrade Phases */}
      {home.phases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">
            Upgrade Phases ({completedPhases}/{home.phases.length} complete)
          </h2>
          <div className="space-y-3">
            {home.phases.map((phase) => {
              const StatusIcon = PHASE_STATUS_ICONS[phase.status] || Clock;
              const statusColor = PHASE_STATUS_COLORS[phase.status] || "text-gray-400";
              const categories: string[] = JSON.parse(phase.categories);
              const phaseDef = EFFICIENCY_PHASES.find(p => p.phase === phase.phaseNumber);
              const fundingProgress = phase.estimatedCost > 0 ? phase.amountFunded / phase.estimatedCost : 0;

              return (
                <div key={phase.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${statusColor} ${phase.status === "in_progress" ? "animate-spin" : ""}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Phase {phase.phaseNumber}: {phaseDef?.label || phase.phaseName}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {categories.map(c => EFFICIENCY_UPGRADE_LABELS[c as EfficiencyUpgradeCategory] || c).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${phase.estimatedCost.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{phase.status.replace("_", " ")}</div>
                    </div>
                  </div>

                  {/* Funding progress bar */}
                  {phase.estimatedCost > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>${phase.amountFunded.toLocaleString()} funded</span>
                        <span>{Math.round(fundingProgress * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00897B] rounded-full transition-all"
                          style={{ width: `${Math.min(100, fundingProgress * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Gap funding indicator */}
                  {phase.gapAmount && phase.gapAmount > 0 && (
                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      Gap funding needed: ${(phase.gapAmount - phase.gapFunded).toLocaleString()} remaining
                    </div>
                  )}

                  {phase.contractorName && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Contractor: {phase.contractorName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Upgrade Plan (from assessment) */}
      {upgradePlan.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">
            Recommended Upgrades
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {upgradePlan
              .filter(item => item.needed)
              .sort((a, b) => a.priority - b.priority)
              .map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {EFFICIENCY_UPGRADE_LABELS[item.category] || item.category}
                    </span>
                    {item.notes && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{item.notes}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Priority {item.priority}</span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Neighborhood Cascade */}
      {home.neighborhoodBatch && (
        <motion.div
          className="bg-gradient-to-br from-[#FFA000]/5 to-[#FFA000]/10 dark:from-[#FFA000]/10 dark:to-[#FFA000]/20 rounded-xl p-4 border border-[#FFA000]/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-5 w-5 text-[#FFA000]" />
            <span className="font-semibold text-gray-900 dark:text-white">Part of Neighborhood Cascade</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {home.neighborhoodBatch.name} &middot; {home.neighborhoodBatch.homeCount} homes &middot; {home.neighborhoodBatch.status}
          </p>
        </motion.div>
      )}

      {/* No assessment yet */}
      {!home.assessment && (
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Clock className="h-10 w-10 text-blue-400 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Assessment Pending</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your home is queued for an energy assessment. Once complete, you&apos;ll see your upgrade plan, cost estimates, and projected savings.
          </p>
        </motion.div>
      )}
    </div>
  );
}
