'use client';

import { motion } from 'framer-motion';

interface GoalProgressProps {
  goal: {
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
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function GoalProgress({ goal, onEdit, onDelete }: GoalProgressProps) {
  const isCompleted = goal.status === 'completed';
  const isExpired = goal.status === 'expired';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div
        className={`p-4 ${
          isCompleted
            ? 'bg-gradient-to-r from-green-500 to-teal'
            : isExpired
            ? 'bg-gray-400'
            : 'bg-gradient-to-r from-ocean to-teal'
        } text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">{goal.periodLabel} Giving Goal</p>
            <p className="text-2xl font-bold">{goal.formattedTarget}</p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Achieved!</span>
            </div>
          )}
          {isExpired && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              Expired
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {goal.progress}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${
                isCompleted
                  ? 'bg-green-500'
                  : isExpired
                  ? 'bg-gray-400'
                  : 'bg-ocean'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Given</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.formattedCurrent}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.formattedRemaining}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {goal.dateRange}
        </p>

        {!isCompleted && !isExpired && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 text-sm text-ocean dark:text-sky border border-ocean dark:border-sky rounded-lg hover:bg-ocean/5 dark:hover:bg-sky/10 transition-colors"
              >
                Edit Goal
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
