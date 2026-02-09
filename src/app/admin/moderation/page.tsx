'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/lib/i18n/formatting';

interface ContentFlag {
  id: string;
  contentType: string;
  contentId: string;
  flagType: string;
  confidence: number;
  reason: string | null;
  createdAt: string;
}

interface ModerationStats {
  pending: number;
  reviewedToday: number;
  dismissed: number;
  actioned: number;
  byType: Record<string, number>;
}

const FLAG_TYPES = ['spam', 'inappropriate', 'fraud_risk', 'off_topic', 'duplicate'];
const CONTENT_TYPES = ['project', 'comment', 'story', 'loan', 'discussion'];

export default function ModerationPage() {
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterContent, setFilterContent] = useState('');

  useEffect(() => {
    loadData();
  }, [filterType, filterContent]);

  async function loadData() {
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('flagType', filterType);
      if (filterContent) params.set('contentType', filterContent);

      const [flagsRes, statsRes] = await Promise.all([
        fetch(`/api/ai/moderate?${params.toString()}`),
        fetch('/api/ai/moderate?action=stats'),
      ]);

      if (flagsRes.ok) {
        const data = await flagsRes.json();
        setFlags(data.flags);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(flagId: string, decision: 'dismiss' | 'action', action?: string) {
    try {
      const res = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          flagId,
          decision,
          actionTaken: action,
        }),
      });

      if (res.ok) {
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
        if (stats) {
          setStats({
            ...stats,
            pending: stats.pending - 1,
            reviewedToday: stats.reviewedToday + 1,
            [decision === 'dismiss' ? 'dismissed' : 'actioned']:
              stats[decision === 'dismiss' ? 'dismissed' : 'actioned'] + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error reviewing flag:', error);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-storm dark:text-dark-text">
          Content Moderation
        </h1>
        <p className="text-storm-light dark:text-dark-text-secondary mt-2">
          Review AI-flagged content for potential issues
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Pending</p>
            <p className="text-3xl font-bold text-gold">{stats.pending}</p>
          </div>
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Reviewed Today</p>
            <p className="text-3xl font-bold text-teal">{stats.reviewedToday}</p>
          </div>
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Dismissed</p>
            <p className="text-3xl font-bold text-storm-light dark:text-dark-text-secondary">
              {stats.dismissed}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-1">Actioned</p>
            <p className="text-3xl font-bold text-red-500">{stats.actioned}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
        >
          <option value="">All Flag Types</option>
          {FLAG_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              {stats?.byType[type] ? ` (${stats.byType[type]})` : ''}
            </option>
          ))}
        </select>

        <select
          value={filterContent}
          onChange={(e) => setFilterContent(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
        >
          <option value="">All Content Types</option>
          {CONTENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}s
            </option>
          ))}
        </select>
      </div>

      {/* Flags List */}
      {flags.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-elevated rounded-xl">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-storm-light dark:text-dark-text-secondary">
            No pending items to review. Great work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        flag.flagType === 'spam'
                          ? 'bg-red-100 text-red-600'
                          : flag.flagType === 'fraud_risk'
                          ? 'bg-gold/20 text-gold'
                          : 'bg-gray-200 text-storm'
                      }`}
                    >
                      {flag.flagType.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-storm-light dark:text-dark-text-secondary">
                      {flag.contentType}
                    </span>
                    <span className="text-sm text-storm-light dark:text-dark-text-secondary">
                      {Math.round(flag.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                    {flag.reason || 'No specific reason provided'}
                  </p>
                </div>
                <p className="text-xs text-storm/40 dark:text-dark-text/40">
                  {formatDateTime(flag.createdAt)}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReview(flag.id, 'dismiss')}
                  className="px-4 py-2 bg-gray-100 text-storm dark:text-dark-text rounded-lg text-sm hover:bg-gray-200"
                >
                  Dismiss
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReview(flag.id, 'action', 'hide')}
                  className="px-4 py-2 bg-gold/10 text-gold rounded-lg text-sm hover:bg-gold/20"
                >
                  Hide Content
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReview(flag.id, 'action', 'delete')}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                >
                  Delete
                </motion.button>
                <button
                  onClick={() => window.open(`/${flag.contentType}s/${flag.contentId}`, '_blank')}
                  className="px-4 py-2 text-ocean dark:text-sky text-sm hover:underline ml-auto"
                >
                  View Content →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
