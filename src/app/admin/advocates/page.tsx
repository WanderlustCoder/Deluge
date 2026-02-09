'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { APPRECIATION_TYPES } from '@/lib/advocates/appreciation';
import { formatDate } from '@/lib/i18n/formatting';

interface Advocate {
  id: string;
  status: string;
  region: string | null;
  bio: string | null;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  _count: {
    activities: number;
    events: number;
  };
}

interface PendingInterest {
  id: string;
  motivation: string;
  interests: string | null;
  availability: string | null;
  region: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  };
}

interface Stats {
  totalActive: number;
  totalEvents: number;
  totalActivities: number;
  regions: string[];
}

export default function AdminAdvocatesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingInterest[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAppreciation, setShowAppreciation] = useState<string | null>(null);
  const [appreciationType, setAppreciationType] = useState('thank_you');
  const [appreciationMessage, setAppreciationMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/advocates');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPending(data.pending || []);
        setAdvocates(data.advocates || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcome = async (interestId: string) => {
    setActionLoading(interestId);
    try {
      const res = await fetch('/api/admin/advocates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'welcome', interestId }),
      });

      if (res.ok) {
        toast('Advocate welcomed!', 'success');
        fetchData();
      } else {
        const error = await res.json();
        toast(error.error || 'Failed to welcome', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (interestId: string) => {
    setActionLoading(interestId);
    try {
      const res = await fetch('/api/admin/advocates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', interestId }),
      });

      if (res.ok) {
        toast('Interest declined', 'info');
        fetchData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendAppreciation = async (advocateId: string) => {
    try {
      const res = await fetch(`/api/admin/advocates/${advocateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: appreciationType,
          message: appreciationMessage,
        }),
      });

      if (res.ok) {
        toast('Appreciation sent!', 'success');
        setShowAppreciation(null);
        setAppreciationMessage('');
      }
    } catch (error) {
      toast('Failed to send appreciation', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Community Advocates
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage the advocate program
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Advocates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActive}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Interests</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pending.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Events Hosted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Regions Covered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.regions.length}</p>
              </div>
            </div>
          )}

          {/* Pending Interests */}
          {pending.length > 0 && (
            <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pending Interests ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map((interest) => (
                  <div
                    key={interest.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {interest.user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {interest.user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          <span className="font-medium">Why:</span> {interest.motivation}
                        </p>
                        {interest.interests && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {interest.interests.split(',').map((i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-ocean-100 dark:bg-ocean-900/30 rounded-full text-xs text-ocean-700 dark:text-ocean-400"
                              >
                                {i.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted {formatDate(interest.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleWelcome(interest.id)}
                          disabled={actionLoading === interest.id}
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === interest.id ? 'Welcoming...' : 'Welcome'}
                        </button>
                        <button
                          onClick={() => handleDecline(interest.id)}
                          disabled={actionLoading === interest.id}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Advocates List */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Advocates
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Region</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Activities</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Events</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {advocates.map((advocate) => (
                    <tr key={advocate.id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-3 px-4">
                        <p className="text-gray-900 dark:text-white">{advocate.user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{advocate.user.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {advocate.region || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {advocate._count.activities}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {advocate._count.events}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          advocate.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : advocate.status === 'paused'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {advocate.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {formatDate(advocate.joinedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setShowAppreciation(advocate.id)}
                          className="text-ocean-600 dark:text-ocean-400 hover:underline"
                        >
                          Send Thanks
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

      {/* Appreciation Modal */}
      {showAppreciation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAppreciation(null)}
          />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Send Appreciation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={appreciationType}
                  onChange={(e) => setAppreciationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {APPRECIATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personal Message (optional)
                </label>
                <textarea
                  value={appreciationMessage}
                  onChange={(e) => setAppreciationMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Write a personal thank you..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAppreciation(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendAppreciation(showAppreciation)}
                  className="flex-1 px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
