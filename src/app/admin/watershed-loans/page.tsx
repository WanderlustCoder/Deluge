"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Droplets,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatDate } from "@/lib/i18n/formatting";

interface WatershedLoanSummary {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  selfFundedAmount: number;
  communityFundedAmount: number;
  remainingBalance: number;
  communityRemainingBalance: number;
  type: string;
  status: string;
  fundingLockActive: boolean;
  paymentsRemaining: number;
  monthlyPayment: number;
  createdAt: string;
}

export default function AdminWatershedLoansPage() {
  const { data: session, status } = useSession();
  const [loans, setLoans] = useState<WatershedLoanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  if (status === "unauthenticated") redirect("/login");
  if (session?.user?.accountType !== "admin") redirect("/dashboard");

  useEffect(() => {
    fetch("/api/admin/watershed-loans")
      .then((r) => r.json())
      .then((data) => setLoans(data.loans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredLoans =
    filter === "all"
      ? loans
      : filter === "at_risk"
        ? loans.filter((l) => ["late", "at_risk", "defaulted"].includes(l.status))
        : filter === "locked"
          ? loans.filter((l) => l.fundingLockActive)
          : loans.filter((l) => l.status === filter);

  const stats = {
    total: loans.length,
    active: loans.filter((l) =>
      ["active", "late", "at_risk", "recovering"].includes(l.status)
    ).length,
    atRisk: loans.filter((l) =>
      ["late", "at_risk", "defaulted"].includes(l.status)
    ).length,
    locked: loans.filter((l) => l.fundingLockActive).length,
    totalOutstanding: loans
      .filter((l) => !["completed", "defaulted"].includes(l.status))
      .reduce((sum, l) => sum + l.remainingBalance, 0),
    communityExposure: loans
      .filter((l) => !["completed", "defaulted"].includes(l.status))
      .reduce((sum, l) => sum + l.communityRemainingBalance, 0),
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    funding: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    late: "bg-amber-100 text-amber-800",
    at_risk: "bg-red-100 text-red-800",
    defaulted: "bg-red-200 text-red-900",
    recovering: "bg-purple-100 text-purple-800",
    completed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-[#00897B]" />
            Watershed Loans
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all watershed and watershed-backed loans
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<DollarSign />} label="Total Loans" value={stats.total} />
        <StatCard icon={<CheckCircle />} label="Active" value={stats.active} />
        <StatCard icon={<AlertTriangle />} label="At Risk" value={stats.atRisk} color="red" />
        <StatCard icon={<Lock />} label="Locked" value={stats.locked} color="amber" />
        <StatCard
          icon={<DollarSign />}
          label="Outstanding"
          value={`$${stats.totalOutstanding.toFixed(0)}`}
        />
        <StatCard
          icon={<DollarSign />}
          label="Community Exposure"
          value={`$${stats.communityExposure.toFixed(0)}`}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "active", "funding", "at_risk", "locked", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[#0D47A1] text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {f === "at_risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Loans Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No watershed loans found.
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Borrower</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Self-Funded</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Community</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Remaining</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Lock</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{loan.userName}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {loan.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${loan.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">${loan.selfFundedAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">${loan.communityFundedAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">${loan.remainingBalance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status] || ""}`}>
                        {loan.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {loan.fundingLockActive ? (
                        <Lock className="w-4 h-4 text-amber-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(loan.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color = "gray",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    gray: "text-gray-500",
    red: "text-red-500",
    amber: "text-amber-500",
    blue: "text-blue-500",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className={`w-5 h-5 mb-2 ${colorMap[color]}`}>{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
