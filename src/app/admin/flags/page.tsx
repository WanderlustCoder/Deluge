'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Search, Eye, X, Clock } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useToast } from '@/components/ui/toast';
import {
  FLAG_TYPE_LABELS,
  FLAG_SEVERITY_LABELS,
  FLAG_SEVERITY_COLORS,
  FlagType,
  FlagSeverity,
  FlagStatus,
} from '@/lib/verification/fraud-detection';

interface Flag {
  id: string;
  projectId: string;
  type: FlagType;
  severity: FlagSeverity;
  description: string;
  status: FlagStatus;
  reportedBy: string | null;
  assignedTo: string | null;
  resolvedBy: string | null;
  resolution: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    category: string;
    fundingGoal: number;
    fundingRaised: number;
    status: string;
  };
}

interface Stats {
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  openCount: number;
  criticalCount: number;
}

const SEVERITY_STYLES: Record<FlagSeverity, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminFlagsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterSeverity, filterType]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSeverity) params.set('severity', filterSeverity);
      if (filterType) params.set('type', filterType);

      const res = await fetch(`/api/admin/flags?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFlags(data.flags || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async (flagId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'investigate' }),
      });

      if (res.ok) {
        toast('Investigation started', 'success');
        fetchData();
      }
    } catch (error) {
      toast('Failed to start investigation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (flagId: string, dismiss: boolean = false) => {
    if (!resolution.trim() && !dismiss) {
      toast('Please provide a resolution', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: dismiss ? 'dismiss' : 'resolve',
          resolution: resolution.trim() || 'Dismissed without action',
        }),
      });

      if (res.ok) {
        toast(dismiss ? 'Flag dismissed' : 'Flag resolved', 'success');
        setSelectedFlag(null);
        setResolution('');
        fetchData();
      }
    } catch (error) {
      toast('Failed to resolve flag', 'error');
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
              Project Flags
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and investigate reported projects
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Open Flags</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.criticalCount}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Investigating</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.byStatus['investigating'] || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.byStatus['resolved'] || 0}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(FLAG_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Flags List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {flags.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No open flags to review</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {flags.map((flag) => (
                  <div key={flag.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLES[flag.severity]}`}>
                            {FLAG_SEVERITY_LABELS[flag.severity]}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {FLAG_TYPE_LABELS[flag.type]}
                          </span>
                          {flag.status === 'investigating' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Investigating
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/projects/${flag.project.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-ocean-600"
                        >
                          {flag.project.title}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {flag.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Reported {new Date(flag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {flag.status === 'open' && (
                          <button
                            onClick={() => handleInvestigate(flag.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                          >
                            Investigate
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFlag(flag)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedFlag && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedFlag(null)} />
          <div className="fixed inset-4 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-full md:max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Flag Details</h2>
              <button
                onClick={() => setSelectedFlag(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLES[selectedFlag.severity]}`}>
                  {FLAG_SEVERITY_LABELS[selectedFlag.severity]}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {FLAG_TYPE_LABELS[selectedFlag.type]}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</h3>
                <Link
                  href={`/projects/${selectedFlag.project.id}`}
                  className="text-ocean-600 hover:underline"
                >
                  {selectedFlag.project.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${selectedFlag.project.fundingRaised.toFixed(2)} / ${selectedFlag.project.fundingGoal.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedFlag.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <p className="text-gray-900 dark:text-white capitalize">{selectedFlag.status}</p>
              </div>

              {selectedFlag.status !== 'resolved' && selectedFlag.status !== 'dismissed' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resolution Notes
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe the resolution..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleResolve(selectedFlag.id, false)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(selectedFlag.id, true)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {selectedFlag.resolution && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolution</h3>
                  <p className="text-gray-900 dark:text-white">{selectedFlag.resolution}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
