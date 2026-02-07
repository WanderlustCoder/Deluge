'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RecurringCard } from '@/components/recurring/recurring-card';
import { SetupRecurringModal } from '@/components/recurring/setup-recurring-modal';
import { GoalProgress } from '@/components/giving/goal-progress';
import Link from 'next/link';

interface RecurringData {
  watershed: {
    id: string;
    amount: number;
    frequency: string;
    status: string;
    nextChargeDate: string;
    pausedUntil?: string | null;
  } | null;
  projects: Array<{
    id: string;
    amount: number;
    frequency: string;
    status: string;
    nextChargeDate: string;
    project: {
      id: string;
      title: string;
      fundingGoal: number;
      fundingRaised: number;
      status: string;
    };
  }>;
  communities: Array<{
    id: string;
    amount: number;
    frequency: string;
    status: string;
    allocationRule: string;
    nextChargeDate: string;
    community: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  }>;
  monthlyTotal: number;
}

interface Goal {
  id: string;
  targetAmount: number;
  currentAmount: number;
  period: string;
  periodLabel: string;
  dateRange: string;
  progress: number;
  remaining: number;
  formattedTarget: string;
  formattedCurrent: string;
  formattedRemaining: string;
  status: string;
}

export default function RecurringPage() {
  const [data, setData] = useState<RecurringData | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const fetchData = async () => {
    try {
      const [recurringRes, goalRes] = await Promise.all([
        fetch('/api/recurring'),
        fetch('/api/giving-goals?active=true'),
      ]);

      if (recurringRes.ok) {
        const recurringData = await recurringRes.json();
        setData(recurringData);
      }

      if (goalRes.ok) {
        const goalData = await goalRes.json();
        setGoal(goalData.goal);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSetupRecurring = async (formData: { amount: number; frequency: string }) => {
    const response = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to set up recurring');
    }

    fetchData();
  };

  const handleAction = async (action: string, id?: string) => {
    if (!id) return;

    const response = await fetch(`/api/recurring/${id}`, {
      method: action === 'cancel' ? 'DELETE' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      fetchData();
    }
  };

  const handleCreateGoal = async (formData: { targetAmount: number; period: string }) => {
    const response = await fetch('/api/giving-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create goal');
    }

    fetchData();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recurring Giving
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your automatic contributions and giving goals
        </p>
      </div>

      {/* Monthly Summary */}
      {data && data.monthlyTotal > 0 && (
        <div className="bg-gradient-to-r from-ocean to-teal rounded-xl p-6 text-white mb-6">
          <p className="text-sm opacity-80">Total Monthly Giving</p>
          <p className="text-4xl font-bold">${data.monthlyTotal.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-1">
            across {(data.projects.length || 0) + (data.communities.length || 0) + (data.watershed ? 1 : 0)} subscriptions
          </p>
        </div>
      )}

      {/* Watershed Recurring */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Watershed Contribution
        </h2>

        {data?.watershed ? (
          <RecurringCard
            recurring={data.watershed}
            onEdit={() => setShowSetupModal(true)}
            onPause={() => handleAction('pause', data.watershed?.id)}
            onResume={() => handleAction('resume', data.watershed?.id)}
            onCancel={() => handleAction('cancel', data.watershed?.id)}
            onSkip={() => handleAction('skip', data.watershed?.id)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recurring contribution set up
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Automatically add to your watershed every month
            </p>
            <button
              onClick={() => setShowSetupModal(true)}
              className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors font-medium"
            >
              Set Up Recurring
            </button>
          </motion.div>
        )}
      </section>

      {/* Giving Goal */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Giving Goal
        </h2>

        {goal ? (
          <GoalProgress
            goal={goal}
            onEdit={() => setShowGoalModal(true)}
            onDelete={async () => {
              await fetch(`/api/giving-goals/${goal.id}`, { method: 'DELETE' });
              fetchData();
            }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Set a giving goal
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track your progress toward a personal giving target
            </p>
            <button
              onClick={() => setShowGoalModal(true)}
              className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors font-medium"
            >
              Set Goal
            </button>
          </motion.div>
        )}
      </section>

      {/* Project Subscriptions */}
      {data?.projects && data.projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Project Subscriptions
          </h2>
          <div className="space-y-4">
            {data.projects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/projects/${sub.project.id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-ocean"
                    >
                      {sub.project.title}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${sub.amount.toFixed(2)}/{sub.frequency}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community Subscriptions */}
      {data?.communities && data.communities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Community Subscriptions
          </h2>
          <div className="space-y-4">
            {data.communities.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/communities/${sub.community.id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-ocean"
                    >
                      {sub.community.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${sub.amount.toFixed(2)}/{sub.frequency} • {sub.allocationRule} projects
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      sub.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Setup Modal */}
      <SetupRecurringModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSubmit={handleSetupRecurring}
      />

      {/* Goal Modal - Simple inline for now */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowGoalModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Set Giving Goal
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                await handleCreateGoal({
                  targetAmount: parseFloat(formData.get('amount') as string),
                  period: formData.get('period') as string,
                });
                setShowGoalModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="amount"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="100"
                    required
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period
                </label>
                <select
                  name="period"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  defaultValue="monthly"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal text-white rounded-lg"
                >
                  Set Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
