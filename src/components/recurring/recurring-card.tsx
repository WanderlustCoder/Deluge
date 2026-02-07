'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface RecurringCardProps {
  recurring: {
    id: string;
    amount: number;
    frequency: string;
    status: string;
    nextChargeDate: string;
    pausedUntil?: string | null;
  };
  onEdit: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onSkip: () => void;
}

export function RecurringCard({
  recurring,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onSkip,
}: RecurringCardProps) {
  const [showActions, setShowActions] = useState(false);

  const frequencyLabels: Record<string, string> = {
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const isPaused = recurring.status === 'paused';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-ocean to-teal p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Recurring Watershed Contribution</p>
            <p className="text-2xl font-bold">${recurring.amount.toFixed(2)}</p>
            <p className="text-sm opacity-80">{frequencyLabels[recurring.frequency]}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPaused
                ? 'bg-amber-500/20 text-amber-100'
                : 'bg-white/20 text-white'
            }`}
          >
            {isPaused ? 'Paused' : 'Active'}
          </div>
        </div>
      </div>

      <div className="p-4">
        {isPaused ? (
          <div className="text-center py-2 text-amber-600 dark:text-amber-400">
            <p className="text-sm">
              {recurring.pausedUntil
                ? `Paused until ${formatDate(recurring.pausedUntil)}`
                : 'Paused indefinitely'}
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Next charge</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatDate(recurring.nextChargeDate)}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex-1 px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors font-medium"
            >
              Resume
            </button>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {showActions && !isPaused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2"
          >
            <button
              onClick={onSkip}
              className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              Skip next charge
            </button>
            <button
              onClick={onPause}
              className="w-full px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors text-left"
            >
              Pause contributions
            </button>
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
            >
              Cancel recurring
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
