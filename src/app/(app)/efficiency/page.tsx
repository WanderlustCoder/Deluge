"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Zap,
  Sun,
  Thermometer,
  Plus,
  ChevronRight,
  Wind,
  Gauge,
  Leaf,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface HomeData {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  homeType: string;
  status: string;
  entryTrack: string;
  energyScoreBefore: number | null;
  energyScoreAfter: number | null;
  currentEnergyBill: number | null;
  createdAt: string;
  assessment: {
    efficiencyScore: number | null;
    totalEstimatedCost: number;
    projectedSavingsKwh: number | null;
    projectedSavingsDollars: number | null;
    projectedCo2Reduction: number | null;
  } | null;
  phases: Array<{
    id: string;
    phaseNumber: number;
    phaseName: string;
    estimatedCost: number;
    amountFunded: number;
    status: string;
  }>;
}

interface PlatformStats {
  totalHomes: number;
  completedHomes: number;
  inProgressHomes: number;
  totalKwhSaved: number;
  totalDollarsSaved: number;
  totalCo2Reduced: number;
  totalSolarCapacityKw: number;
  activeCascades: number;
}

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  assessment_queued: "Assessment Queued",
  assessed: "Assessed",
  funding: "Funding",
  in_progress: "In Progress",
  completed: "Completed",
  withdrawn: "Withdrawn",
};

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  assessment_queued: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  assessed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  funding: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  in_progress: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function EfficiencyPage() {
  const { data: session, status } = useSession();
  const [homes, setHomes] = useState<HomeData[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  if (status === "unauthenticated") redirect("/login");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [homesRes, statsRes] = await Promise.all([
        fetch("/api/efficiency/applications"),
        fetch("/api/efficiency/stats"),
      ]);
      const homesData = await homesRes.json();
      const statsData = await statsRes.json();
      setHomes(homesData.homes || []);
      setStats(statsData);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFA000]/10 text-[#FFA000] flex items-center justify-center">
            <Sun className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Home Efficiency Program
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upgrade your home for energy efficiency and solar generation
            </p>
          </div>
        </div>
      </motion.div>

      {/* Program Overview */}
      <motion.div
        className="bg-gradient-to-br from-[#0D47A1]/5 to-[#00897B]/5 dark:from-[#0D47A1]/10 dark:to-[#00897B]/10 rounded-2xl p-6 border border-[#0D47A1]/10 dark:border-[#0D47A1]/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Thermometer, label: "Seal", desc: "Insulate, seal, and upgrade doors and windows" },
            { icon: Wind, label: "Upgrade", desc: "Modern HVAC, water heating, and electrical" },
            { icon: Sun, label: "Generate", desc: "Reinforce roof and install solar panels" },
            { icon: Gauge, label: "Save", desc: "Reduce energy bills and grid strain" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3">
              <step.icon className="h-8 w-8 text-[#00897B] mb-2" />
              <div className="font-semibold text-sm text-gray-900 dark:text-white">{step.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{step.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platform Impact Stats */}
      {stats && (stats.totalHomes > 0 || stats.completedHomes > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">Platform Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Homes Enrolled", value: stats.totalHomes, icon: Home },
              { label: "Homes Completed", value: stats.completedHomes, icon: Zap },
              { label: "kWh Saved/Year", value: stats.totalKwhSaved.toLocaleString(), icon: Gauge },
              { label: "CO2 Reduced (tons)", value: stats.totalCo2Reduced, icon: Leaf },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <stat.icon className="h-5 w-5 text-[#00897B] mb-1" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Apply Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link
          href="/efficiency/apply"
          className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#0D47A1] hover:bg-[#0D47A1]/90 text-white rounded-xl font-semibold transition-colors"
        >
          <Plus className="h-5 w-5" />
          Apply for Home Efficiency Upgrade
        </Link>
      </motion.div>

      {/* User's Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-3">
          Your Applications
        </h2>
        {homes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <Home className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No applications yet. Apply above to get your home assessed for energy efficiency upgrades.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {homes.map((home) => (
              <Link
                key={home.id}
                href={`/efficiency/${home.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#0D47A1]/30 dark:hover:border-[#0D47A1]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {home.address}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {home.city}, {home.state} {home.zipCode}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[home.status] || STATUS_COLORS.applied}`}>
                        {STATUS_LABELS[home.status] || home.status}
                      </span>
                      {home.assessment && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Score: {home.assessment.efficiencyScore}/100
                        </span>
                      )}
                      {home.phases.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {home.phases.filter(p => p.status === "completed" || p.status === "verified").length}/{home.phases.length} phases
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                {/* Phase progress bar */}
                {home.phases.length > 0 && (
                  <div className="mt-3 flex gap-1">
                    {home.phases.map((phase) => (
                      <div
                        key={phase.id}
                        className={`h-2 flex-1 rounded-full ${
                          phase.status === "completed" || phase.status === "verified"
                            ? "bg-green-500"
                            : phase.status === "in_progress"
                            ? "bg-[#FFA000]"
                            : phase.status === "funded" || phase.status === "funding"
                            ? "bg-[#42A5F5]"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                        title={`Phase ${phase.phaseNumber}: ${phase.phaseName} (${phase.status})`}
                      />
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
