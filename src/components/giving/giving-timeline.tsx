'use client';

import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  type: string;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  date: Date | string;
  formattedDate: string;
  projectName?: string | null;
  communityName?: string | null;
}

interface GivingTimelineProps {
  items: TimelineItem[];
}

export function GivingTimeline({ items }: GivingTimelineProps) {
  const typeIcons: Record<string, string> = {
    cash: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    ad_funded: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    referral: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    matching: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  };

  const typeColors: Record<string, string> = {
    cash: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    ad_funded: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    referral: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    matching: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg
          className="mx-auto h-12 w-12 mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>No giving activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4"
          >
            {/* Icon */}
            <div
              className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                typeColors[item.type] || 'text-gray-500 bg-gray-100'
              }`}
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
                  d={typeIcons[item.type] || typeIcons.cash}
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.typeLabel}
                  </span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.formattedAmount}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.formattedDate}
                </span>
              </div>

              {(item.projectName || item.communityName) && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.projectName && <p>Project: {item.projectName}</p>}
                  {item.communityName && <p>Community: {item.communityName}</p>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
