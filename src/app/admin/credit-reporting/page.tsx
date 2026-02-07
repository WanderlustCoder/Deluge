'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import Link from 'next/link';

interface BureauConnection {
  bureau: string;
  isConnected: boolean;
  lastConnectionAt: string | null;
  environment: string;
}

interface SubmissionStats {
  total: number;
  successful: number;
  failed: number;
  lastSubmission: string | null;
}

interface DisputeStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  escalated: number;
}

interface RecentSubmission {
  id: string;
  bureau: string;
  reportingPeriod: string;
  status: string;
  recordCount: number;
  submittedAt: string;
}

interface CreditReportingOverview {
  bureauConfig: Record<string, boolean>;
  bureauConnections: BureauConnection[];
  submissionStats: SubmissionStats;
  recentSubmissions: RecentSubmission[];
  disputeStats: DisputeStats;
  totalLoansWithConsent: number;
  activeReporting: number;
}

export default function AdminCreditReportingPage() {
  const [data, setData] = useState<CreditReportingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/credit-reporting');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch credit reporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/admin/credit-reporting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (res.ok) {
        setSubmitResult(`Submitted to ${result.results.totalSuccess} bureaus successfully`);
        fetchData();
      } else {
        setSubmitResult(`Error: ${result.error}`);
      }
    } catch (error) {
      setSubmitResult('Failed to submit to bureaus');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Credit Reporting
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage credit bureau submissions and compliance
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/credit-disputes"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                View Disputes
              </Link>
              <button
                onClick={handleManualSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit to Bureaus'}
              </button>
            </div>
          </div>

          {submitResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitResult.startsWith('Error')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {submitResult}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Loans with Consent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.totalLoansWithConsent || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Reporting</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.activeReporting || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.submissionStats?.total || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Open Disputes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(data?.disputeStats?.open || 0) + (data?.disputeStats?.investigating || 0)}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Bureau Connections */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bureau Connections
              </h2>
              <div className="space-y-3">
                {data?.bureauConnections?.map((conn) => (
                  <div
                    key={conn.bureau}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {conn.bureau}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {conn.environment} environment
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        conn.isConnected
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {conn.isConnected ? 'Connected' : 'Not configured'}
                      </span>
                      {conn.lastConnectionAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Last: {new Date(conn.lastConnectionAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Dispute Summary */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dispute Summary
                </h2>
                <Link
                  href="/admin/credit-disputes"
                  className="text-sm text-ocean-600 dark:text-sky-400 hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">Open</p>
                  <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                    {data?.disputeStats?.open || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">Investigating</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                    {data?.disputeStats?.investigating || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">Resolved</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    {data?.disputeStats?.resolved || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-400">Escalated</p>
                  <p className="text-xl font-bold text-orange-800 dark:text-orange-300">
                    {data?.disputeStats?.escalated || 0}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Recent Submissions */}
          <section className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Submissions
            </h2>
            {data?.recentSubmissions?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Bureau</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Records</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSubmissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">{sub.bureau}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(sub.reportingPeriod).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{sub.recordCount}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            sub.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : sub.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No submissions yet
              </p>
            )}
          </section>

          {/* Metro 2 Format Info */}
          <section className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Metro 2 Format
            </h2>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              All credit bureau submissions use the industry-standard Metro 2 format.
              Reports are generated monthly and include base segments with account status,
              payment history (24-month pattern), and compliance indicators.
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Record Length:</span>
                <span className="ml-2 text-blue-800 dark:text-blue-400">426 bytes</span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Format:</span>
                <span className="ml-2 text-blue-800 dark:text-blue-400">Fixed-width ASCII</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
