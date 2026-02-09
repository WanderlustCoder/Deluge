'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Users, AlertTriangle, DollarSign, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface EmergencyCampaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  targetAmount: number | null;
  currentAmount: number;
  backerCount: number;
  priority: number;
  status: string;
  updates: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

export default function EmergencyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [emergency, setEmergency] = useState<EmergencyCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadEmergency();
  }, [slug]);

  const loadEmergency = async () => {
    try {
      const res = await fetch(`/api/emergency/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setEmergency(data.emergency);
      }
    } catch (err) {
      console.error('Failed to load emergency:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    setError('');
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum < 0.25) {
      setError('Minimum contribution is $0.25');
      return;
    }

    setContributing(true);

    try {
      const res = await fetch(`/api/emergency/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'contribute', amount: amountNum }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to contribute');
      }

      setSuccess(true);
      setAmount('');
      loadEmergency();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute');
    } finally {
      setContributing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-1/4" />
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-storm-light dark:text-dark-text-secondary">Emergency campaign not found</p>
        <Link
          href="/emergency"
          className="inline-flex items-center gap-2 mt-4 text-ocean dark:text-sky hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Emergencies
        </Link>
      </div>
    );
  }

  const progress =
    emergency.targetAmount && emergency.targetAmount > 0
      ? Math.min(100, (emergency.currentAmount / emergency.targetAmount) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <Link
        href="/emergency"
        className="inline-flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Emergencies
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 ${
          emergency.priority >= 5
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
            : 'bg-white dark:bg-dark-border/50'
        }`}
      >
        {emergency.priority >= 5 && (
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Urgent Response Needed</span>
          </div>
        )}

        <h1
          className={`text-3xl font-bold mb-2 ${
            emergency.priority >= 5 ? '' : 'text-storm dark:text-dark-text'
          }`}
        >
          {emergency.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
          {emergency.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {emergency.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Started {formatDistanceToNow(new Date(emergency.startDate), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {emergency.backerCount} donors
          </span>
        </div>

        <p
          className={
            emergency.priority >= 5
              ? 'text-white/90'
              : 'text-storm-light dark:text-dark-text-secondary'
          }
        >
          {emergency.description}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
          >
            <h2 className="font-semibold text-lg text-storm dark:text-dark-text mb-4">
              Updates
            </h2>

            {emergency.updates.length === 0 ? (
              <p className="text-storm-light dark:text-dark-text-secondary text-center py-4">
                No updates yet
              </p>
            ) : (
              <div className="space-y-4">
                {emergency.updates.map((update) => (
                  <div
                    key={update.id}
                    className="border-l-2 border-ocean dark:border-sky pl-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-storm dark:text-dark-text">
                        {update.title}
                      </h3>
                      <span className="text-xs text-storm-light dark:text-dark-text-secondary">
                        {format(new Date(update.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                      {update.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Donate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
          >
            <h2 className="font-semibold text-lg text-storm dark:text-dark-text mb-4">
              Donate Now
            </h2>

            {/* Progress */}
            {emergency.targetAmount && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-teal">
                    ${emergency.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-storm-light dark:text-dark-text-secondary">
                    of ${emergency.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-teal rounded-full"
                  />
                </div>
                <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
                  {progress.toFixed(0)}% of goal
                </p>
              </div>
            )}

            {success && (
              <div className="bg-teal/10 text-teal p-3 rounded-lg text-sm mb-4">
                Thank you for your donation!
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-storm/50">
                  $
                </span>
                <input
                  type="number"
                  min="0.25"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
                />
              </div>

              <div className="flex gap-2">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1 py-2 border border-gray-200 dark:border-foam/20 rounded-lg text-sm text-storm-light dark:text-dark-text-secondary hover:border-ocean dark:hover:border-sky hover:text-ocean dark:hover:text-sky transition-colors"
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <button
                onClick={handleContribute}
                disabled={contributing || !amount}
                className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {contributing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    Donate Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
