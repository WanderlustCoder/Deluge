'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ShieldCheck, Award, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useToast } from '@/components/ui/toast';
import { VERIFICATION_LEVELS, VerificationLevel } from '@/lib/verification/levels';
import { CHECK_DEFINITIONS, CheckType } from '@/lib/verification/checks';

interface PendingCheck {
  id: string;
  checkType: CheckType;
  status: string;
  evidence: string | null;
  createdAt: string;
  verification: {
    id: string;
    level: string;
    project: {
      id: string;
      title: string;
      category: string;
    };
  };
}

interface Stats {
  byLevel: Record<string, number>;
  pendingChecks: number;
  recentVerifications: number;
}

export default function AdminVerificationPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingChecks, setPendingChecks] = useState<PendingCheck[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<PendingCheck | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/verification');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPendingChecks(data.pendingChecks || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (checkId: string, approved: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verification/${checkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approved ? 'passed' : 'failed',
          notes: reviewNotes,
        }),
      });

      if (res.ok) {
        toast(approved ? 'Check approved' : 'Check rejected', 'success');
        setSelectedCheck(null);
        setReviewNotes('');
        fetchData();
      }
    } catch (error) {
      toast('Failed to update check', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 lg:ml-60 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 lg:ml-60 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Project Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review verification requests and manage trust levels
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingChecks}
                </p>
              </div>
              {(['unverified', 'basic', 'verified', 'audited'] as VerificationLevel[]).map((level) => (
                <div
                  key={level}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {VERIFICATION_LEVELS[level].label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.byLevel[level] || 0}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pending Checks */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Verification Checks
              </h2>
            </div>

            {pendingChecks.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No pending verification checks
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingChecks.map((check) => (
                  <div
                    key={check.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {CHECK_DEFINITIONS[check.checkType]?.label || check.checkType}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(check.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Link
                          href={`/projects/${check.verification.project.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-ocean-600"
                        >
                          {check.verification.project.title}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Current level: {VERIFICATION_LEVELS[check.verification.level as VerificationLevel]?.label}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCheck(check)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-ocean-100 text-ocean-700 hover:bg-ocean-200 dark:bg-ocean-900/30 dark:text-ocean-400 dark:hover:bg-ocean-900/50"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Review Modal */}
      {selectedCheck && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedCheck(null)} />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Review Verification Check
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Project</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedCheck.verification.project.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check Type</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {CHECK_DEFINITIONS[selectedCheck.checkType]?.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {CHECK_DEFINITIONS[selectedCheck.checkType]?.description}
                </p>
              </div>

              {selectedCheck.evidence && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Evidence Submitted</p>
                  <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm overflow-auto max-h-40">
                    {JSON.stringify(JSON.parse(selectedCheck.evidence), null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your review..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleReview(selectedCheck.id, false)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleReview(selectedCheck.id, true)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
