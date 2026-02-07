'use client';

import { getTrustScoreLabel, getTrustScoreColor } from '@/lib/verification/trust-score';

interface TrustScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE_STYLES = {
  sm: {
    container: 'w-8 h-8 text-xs',
    ring: 'ring-2',
  },
  md: {
    container: 'w-12 h-12 text-sm',
    ring: 'ring-3',
  },
  lg: {
    container: 'w-16 h-16 text-base',
    ring: 'ring-4',
  },
};

const COLOR_STYLES: Record<string, { bg: string; ring: string; text: string }> = {
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    ring: 'ring-green-500',
    text: 'text-green-700 dark:text-green-400',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    ring: 'ring-teal-500',
    text: 'text-teal-700 dark:text-teal-400',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    ring: 'ring-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    ring: 'ring-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    ring: 'ring-orange-500',
    text: 'text-orange-700 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    ring: 'ring-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    ring: 'ring-gray-400',
    text: 'text-gray-600 dark:text-gray-400',
  },
};

export function TrustScoreBadge({ score, size = 'md', showLabel = false }: TrustScoreBadgeProps) {
  if (score === null) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`${SIZE_STYLES[size].container} ${SIZE_STYLES[size].ring} ${COLOR_STYLES.gray.bg} ${COLOR_STYLES.gray.ring} ${COLOR_STYLES.gray.text} rounded-full flex items-center justify-center font-bold`}
        >
          ?
        </div>
        {showLabel && (
          <span className={`text-sm ${COLOR_STYLES.gray.text}`}>Not rated</span>
        )}
      </div>
    );
  }

  const color = getTrustScoreColor(score);
  const label = getTrustScoreLabel(score);
  const colorStyles = COLOR_STYLES[color] || COLOR_STYLES.gray;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${SIZE_STYLES[size].container} ${SIZE_STYLES[size].ring} ${colorStyles.bg} ${colorStyles.ring} ${colorStyles.text} rounded-full flex items-center justify-center font-bold`}
        title={`Trust Score: ${score} - ${label}`}
      >
        {score}
      </div>
      {showLabel && (
        <span className={`text-sm ${colorStyles.text}`}>{label}</span>
      )}
    </div>
  );
}

// Progress bar version
export function TrustScoreBar({ score, showPercentage = true }: { score: number | null; showPercentage?: boolean }) {
  if (score === null) {
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Trust Score</span>
          <span>Not rated</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    );
  }

  const color = getTrustScoreColor(score);
  const colorStyles = COLOR_STYLES[color] || COLOR_STYLES.gray;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>Trust Score</span>
        {showPercentage && <span className={colorStyles.text}>{score}%</span>}
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorStyles.ring.replace('ring-', 'bg-')} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
