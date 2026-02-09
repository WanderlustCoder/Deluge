'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { formatDate } from '@/lib/i18n/formatting';

interface Dispute {
  id: string;
  loanId: string;
  userId: string;
  disputeType: string;
  status: string;
  description: string;
  resolution?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  fcraDeadline: string;
  bureausNotified: boolean;
  user?: {
    name: string | null;
    email: string;
  };
  loan?: {
    purpose: string;
    amount: number;
  };
}

interface DisputeStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  escalated: number;
}

const DISPUTE_TYPE_LABELS: Record<string, string> = {
  incorrect_balance: 'Incorrect Balance',
  incorrect_payment: 'Payment Status',
  identity_error: 'Identity Error',
  duplicate: 'Duplicate Account',
  account_status: 'Account Status',
  other: 'Other',
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  investigating: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  escalated: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
};

export default function AdminCreditDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolution, setResolution] = useState('');
  const [escalationReason, setEscalationReason] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      const res = await fetch(`/api/admin/credit-disputes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, data?: Record<string, string>) => {
    if (!selectedDispute) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/credit-disputes/${selectedDispute.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      if (res.ok) {
        fetchDisputes();
        setSelectedDispute(null);
        setResolution('');
        setEscalationReason('');
      }
    } catch (error) {
      console.error('Failed to update dispute:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Credit Disputes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage credit report disputes (FCRA 30-day resolution requirement)
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {['all', 'open', 'investigating', 'resolved', 'escalated'].map((status, i) => (
              <motion.button
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setFilter(status === 'all' ? '' : status)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  (status === 'all' && !filter) || filter === status
                    ? 'border-ocean-600 bg-ocean-50 dark:bg-ocean-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{status}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {status === 'all'
                    ? stats?.total || 0
                    : stats?.[status as keyof DisputeStats] || 0}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Disputes List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {disputes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No disputes found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Loan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Deadline</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Filed</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map((dispute) => {
                      const days = getDaysUntilDeadline(dispute.fcraDeadline);
                      const isUrgent = days <= 7 && dispute.status !== 'resolved';
                      const isOverdue = days < 0 && dispute.status !== 'resolved';
                      const statusStyle = STATUS_STYLES[dispute.status] || STATUS_STYLES.open;

                      return (
                        <tr
                          key={dispute.id}
                          className={`border-b border-gray-100 dark:border-gray-700/50 ${
                            isOverdue ? 'bg-red-50 dark:bg-red-900/10' : isUrgent ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <p className="text-gray-900 dark:text-white">{dispute.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{dispute.user?.email}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {DISPUTE_TYPE_LABELS[dispute.disputeType] || dispute.disputeType}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900 dark:text-white">{dispute.loan?.purpose}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${dispute.loan?.amount?.toFixed(2)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              {dispute.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {dispute.status === 'resolved' ? (
                              <span className="text-gray-500 dark:text-gray-400">-</span>
                            ) : isOverdue ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {Math.abs(days)} days overdue
                              </span>
                            ) : (
                              <span className={days <= 7 ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                                {days} days
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(dispute.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedDispute(dispute)}
                              className="text-ocean-600 dark:text-sky-400 hover:underline"
                            >
                              {dispute.status === 'resolved' ? 'View' : 'Manage'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedDispute(null)}
          />
          <div className="fixed inset-4 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[500px] bg-white dark:bg-gray-800 z-50 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dispute Details
              </h2>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User</h3>
                <p className="text-gray-900 dark:text-white">{selectedDispute.user?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDispute.user?.email}</p>
              </div>

              {/* Loan Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Loan</h3>
                <p className="text-gray-900 dark:text-white">{selectedDispute.loan?.purpose}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ${selectedDispute.loan?.amount?.toFixed(2)}
                </p>
              </div>

              {/* Dispute Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Dispute Type</h3>
                <p className="text-gray-900 dark:text-white">
                  {DISPUTE_TYPE_LABELS[selectedDispute.disputeType] || selectedDispute.disputeType}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedDispute.description}</p>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Timeline</h3>
                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <p>Filed: {formatDate(selectedDispute.createdAt)}</p>
                  <p>FCRA Deadline: {formatDate(selectedDispute.fcraDeadline)}</p>
                  {selectedDispute.resolvedAt && (
                    <p>Resolved: {formatDate(selectedDispute.resolvedAt)}</p>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {selectedDispute.resolution && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Resolution</h3>
                  <p className="text-sm text-green-700 dark:text-green-400">{selectedDispute.resolution}</p>
                </div>
              )}

              {/* Actions */}
              {selectedDispute.status !== 'resolved' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedDispute.status === 'open' && (
                    <button
                      onClick={() => handleAction('investigating')}
                      disabled={actionLoading}
                      className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Updating...' : 'Start Investigation'}
                    </button>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resolution
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Describe the resolution..."
                    />
                    <button
                      onClick={() => handleAction('resolve', { resolution })}
                      disabled={actionLoading || !resolution}
                      className="mt-2 w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Resolving...' : 'Resolve Dispute'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Escalate
                    </label>
                    <textarea
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                      placeholder="Reason for escalation..."
                    />
                    <button
                      onClick={() => handleAction('escalate', { reason: escalationReason })}
                      disabled={actionLoading || !escalationReason}
                      className="mt-2 w-full py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Escalating...' : 'Escalate Dispute'}
                    </button>
                  </div>

                  {selectedDispute.status === 'resolved' && !selectedDispute.bureausNotified && (
                    <button
                      onClick={() => handleAction('notify_bureaus')}
                      disabled={actionLoading}
                      className="w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Notifying...' : 'Notify Bureaus of Resolution'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
