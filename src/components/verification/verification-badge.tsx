'use client';

import { Shield, ShieldCheck, ShieldAlert, Award, HelpCircle } from 'lucide-react';
import { VerificationLevel, VERIFICATION_LEVELS } from '@/lib/verification/levels';

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
}

const ICON_SIZES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const LABEL_SIZES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const LEVEL_STYLES: Record<VerificationLevel, { bg: string; text: string; border: string }> = {
  unverified: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-300 dark:border-gray-700',
  },
  basic: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
  },
  verified: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  audited: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
};

function getIcon(level: VerificationLevel, className: string) {
  switch (level) {
    case 'unverified':
      return <HelpCircle className={className} />;
    case 'basic':
      return <Shield className={className} />;
    case 'verified':
      return <ShieldCheck className={className} />;
    case 'audited':
      return <Award className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}

export function VerificationBadge({
  level,
  size = 'md',
  showLabel = false,
  showTooltip = true,
}: VerificationBadgeProps) {
  const styles = LEVEL_STYLES[level];
  const definition = VERIFICATION_LEVELS[level];

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {getIcon(level, ICON_SIZES[size])}
      {showLabel && (
        <span className={`font-medium ${LABEL_SIZES[size]}`}>
          {definition.label}
        </span>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <div className="group relative inline-block">
        {badge}
        <div className="invisible group-hover:visible absolute z-50 w-64 p-3 mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className={`font-semibold ${styles.text} mb-1`}>{definition.label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{definition.description}</p>
          {level !== 'unverified' && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              <p className="font-medium mb-1">Benefits:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {definition.benefits.slice(0, 2).map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return badge;
}

// Compact version for cards
export function VerificationIcon({ level, size = 'md' }: { level: VerificationLevel; size?: 'sm' | 'md' | 'lg' }) {
  const styles = LEVEL_STYLES[level];

  if (level === 'unverified') {
    return null; // Don't show anything for unverified
  }

  return (
    <div className={`inline-flex ${styles.text}`} title={VERIFICATION_LEVELS[level].label}>
      {getIcon(level, ICON_SIZES[size])}
    </div>
  );
}
