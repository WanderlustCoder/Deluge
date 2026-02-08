'use client';

import { formatDistanceToNow } from 'date-fns';

interface CampaignProgressProps {
  pledgedAmount: number;
  goalAmount: number;
  backerCount: number;
  endDate: string;
  fundingType: string;
  status: string;
}

export function CampaignProgress({
  pledgedAmount,
  goalAmount,
  backerCount,
  endDate,
  fundingType,
  status,
}: CampaignProgressProps) {
  const progressPercent = Math.min(100, Math.round((pledgedAmount / goalAmount) * 100));
  const endDateObj = new Date(endDate);
  const isEnded = endDateObj < new Date();

  const fundingTypeLabel = {
    all_or_nothing: 'All or Nothing',
    flexible: 'Flexible',
    milestone: 'Milestone',
  }[fundingType] || fundingType;

  const fundingTypeDescription = {
    all_or_nothing: 'Pledges are only collected if the goal is reached',
    flexible: 'All pledges are collected regardless of goal',
    milestone: 'Pledges collected at each milestone (25%, 50%, 75%, 100%)',
  }[fundingType] || '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Amount */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          ${pledgedAmount.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          pledged of ${goalAmount.toLocaleString()} goal
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent >= 100 ? 'bg-teal' : 'bg-ocean'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-right text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
          {progressPercent}%
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {backerCount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            backers
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEnded ? 'Ended' : formatDistanceToNow(endDateObj)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEnded ? '' : 'to go'}
          </p>
        </div>
      </div>

      {/* Funding Type */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-sm text-gray-400">info</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {fundingTypeLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {fundingTypeDescription}
        </p>
      </div>
    </div>
  );
}
