"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Sun,
  Home,
  Zap,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Loader2,
} from "lucide-react";

interface HomeEntry {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  homeType: string;
  status: string;
  entryTrack: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  assessment: {
    efficiencyScore: number | null;
    totalEstimatedCost: number;
    projectedSavingsKwh: number | null;
    projectedCo2Reduction: number | null;
  } | null;
  phases: Array<{ id: string; phaseNumber: number; status: string; estimatedCost: number; amountFunded: number }>;
  neighborhoodBatch: { id: string; name: string } | null;
}

interface NominationEntry {
  id: string;
  nomineeAddress: string;
  nomineeCity: string;
  nomineeState: string;
  nomineeZipCode: string;
  nomineeReason: string;
  status: string;
  createdAt: string;
  nominator: { id: string; name: string };
  community: { id: string; name: string } | null;
}

interface Stats {
  totalHomes: number;
  applied: number;
  assessed: number;
  funding: number;
  inProgress: number;
  completed: number;
  totalEstimatedCost: number;
  totalFunded: number;
  pendingNominations: number;
  activeCascades: number;
}

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  assessment_queued: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  assessed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  funding: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  in_progress: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export default function AdminEfficiencyPage() {
  const { data: session, status: authStatus } = useSession();
  const [homes, setHomes] = useState<HomeEntry[]>([]);
  const [nominations, setNominations] = useState<NominationEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState<"homes" | "nominations">("homes");

  if (authStatus === "unauthenticated") redirect("/login");
  if (session?.user?.accountType !== "admin") redirect("/dashboard");

  useEffect(() => {
    fetch("/api/admin/efficiency")
      .then((r) => r.json())
      .then((data) => {
        setHomes(data.homes || []);
        setNominations(data.nominations || []);
        setStats(data.stats || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredHomes =
    filter === "all" ? homes : homes.filter((h) => h.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFA000]/10 text-[#FFA000] flex items-center justify-center">
          <Sun className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
            Home Efficiency Program
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage applications, assessments, and cascades</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Homes", value: stats.totalHomes, icon: Home, color: "text-[#0D47A1]" },
            { label: "Awaiting Assessment", value: stats.applied, icon: Clock, color: "text-yellow-500" },
            { label: "In Progress", value: stats.inProgress, icon: Zap, color: "text-[#FFA000]" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-500" },
            { label: "Total Funded", value: `$${stats.totalFunded.toLocaleString()}`, icon: DollarSign, color: "text-[#00897B]" },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              <s.icon className={`h-4 w-4 ${s.color} mb-1`} />
              <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {([["homes", "Applications", homes.length], ["nominations", "Nominations", nominations.length]] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-[#0D47A1] text-[#0D47A1]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Homes Tab */}
      {tab === "homes" && (
        <>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "applied", label: "Applied" },
              { key: "assessed", label: "Assessed" },
              { key: "funding", label: "Funding" },
              { key: "in_progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  filter === f.key
                    ? "bg-[#0D47A1] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Homes List */}
          <div className="space-y-2">
            {filteredHomes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <Home className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No applications match this filter.</p>
              </div>
            ) : (
              filteredHomes.map((home) => {
                const phasesCompleted = home.phases.filter(p => p.status === "completed" || p.status === "verified").length;
                const totalPhases = home.phases.length;
                return (
                  <div key={home.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{home.address}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[home.status] || statusColors.applied}`}>
                            {home.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {home.city}, {home.state} {home.zipCode} &middot; {home.user.name} ({home.user.email})
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>Track: {home.entryTrack}</span>
                          {home.assessment && (
                            <>
                              <span>Score: {home.assessment.efficiencyScore}/100</span>
                              <span>Est: ${home.assessment.totalEstimatedCost.toLocaleString()}</span>
                              {home.assessment.projectedSavingsKwh && (
                                <span>{home.assessment.projectedSavingsKwh.toLocaleString()} kWh/yr</span>
                              )}
                            </>
                          )}
                          {totalPhases > 0 && <span>Phases: {phasesCompleted}/{totalPhases}</span>}
                          {home.neighborhoodBatch && <span>Cascade: {home.neighborhoodBatch.name}</span>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(home.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {/* Phase progress */}
                    {totalPhases > 0 && (
                      <div className="flex gap-1 mt-2">
                        {home.phases.map((phase) => (
                          <div
                            key={phase.id}
                            className={`h-1.5 flex-1 rounded-full ${
                              phase.status === "completed" || phase.status === "verified"
                                ? "bg-green-500"
                                : phase.status === "in_progress"
                                ? "bg-[#FFA000]"
                                : phase.status === "funded" || phase.status === "funding"
                                ? "bg-[#42A5F5]"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                            title={`Phase ${phase.phaseNumber} (${phase.status})`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Nominations Tab */}
      {tab === "nominations" && (
        <div className="space-y-2">
          {nominations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No pending nominations.</p>
            </div>
          ) : (
            nominations.map((nom) => (
              <div key={nom.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">{nom.nomineeAddress}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[nom.status] || "bg-gray-100 text-gray-800"}`}>
                      {nom.status}
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {nom.nomineeCity}, {nom.nomineeState} {nom.nomineeZipCode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      &ldquo;{nom.nomineeReason}&rdquo;
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Nominated by {nom.nominator.name}
                      {nom.community && ` via ${nom.community.name}`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(nom.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
