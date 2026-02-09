"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/i18n/formatting";

interface AtRiskLoan {
  id: string;
  purpose: string;
  amount: number;
  status: string;
  healthStatus: string;
  daysBehind: number;
  missedPayments: number;
  monthlyPayment: number;
  borrower: {
    id: string;
    name: string;
    email: string;
    creditTier: number;
  };
  repayments: Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
  refinances: Array<{
    id: string;
    newTerm: number;
    createdAt: string;
  }>;
  recoveryPayments?: number;
}

interface Summary {
  total: number;
  late: number;
  atRisk: number;
  defaulted: number;
  recovering: number;
}

const statusColors: Record<string, string> = {
  late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  at_risk: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  defaulted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  recovering: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const statusLabels: Record<string, string> = {
  late: "Late",
  at_risk: "At Risk",
  defaulted: "Defaulted",
  recovering: "Recovering",
};

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<AtRiskLoan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    try {
      const res = await fetch("/api/admin/loans/at-risk");
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans);
        setSummary(data.summary);
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredLoans = filter === "all"
    ? loans
    : loans.filter((l) => l.healthStatus === filter);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Loan Health Dashboard
        </h1>
        <button
          onClick={fetchLoans}
          className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">Total At-Risk</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 shadow-sm border border-yellow-200 dark:border-yellow-800"
          >
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Late (1-30 days)</p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{summary.late}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 shadow-sm border border-orange-200 dark:border-orange-800"
          >
            <p className="text-sm text-orange-600 dark:text-orange-400">At Risk (31-90 days)</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{summary.atRisk}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 shadow-sm border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-600 dark:text-red-400">Defaulted (90+ days)</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">{summary.defaulted}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 shadow-sm border border-blue-200 dark:border-blue-800"
          >
            <p className="text-sm text-blue-600 dark:text-blue-400">Recovering</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{summary.recovering}</p>
          </motion.div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "late", "at_risk", "defaulted", "recovering"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? "bg-ocean text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? "All" : statusLabels[status] || status}
          </button>
        ))}
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Borrower
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Loan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Days Behind
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {filter === "all" ? "No at-risk loans found." : `No ${statusLabels[filter] || filter} loans.`}
                </td>
              </tr>
            ) : (
              filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{loan.borrower.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{loan.borrower.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Tier {loan.borrower.creditTier}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{loan.purpose}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${loan.amount.toFixed(2)} @ ${loan.monthlyPayment.toFixed(2)}/mo
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[loan.healthStatus] || ""}`}>
                      {statusLabels[loan.healthStatus] || loan.healthStatus}
                    </span>
                    {loan.healthStatus === "recovering" && loan.recoveryPayments !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {loan.recoveryPayments}/3 payments
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-medium">{loan.daysBehind} days</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{loan.missedPayments} missed</p>
                  </td>
                  <td className="px-6 py-4">
                    {loan.repayments.length > 0 ? (
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          ${loan.repayments[0].amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(loan.repayments[0].createdAt)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">No payments</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="text-ocean hover:text-ocean/80 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
