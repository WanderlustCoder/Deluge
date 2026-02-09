'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from 'lucide-react';

interface VoteButtonsProps {
  proposalId: string;
  circleSlug: string;
  currentVote?: 'yes' | 'no' | 'abstain' | null;
  disabled?: boolean;
  onVote: (vote: 'yes' | 'no' | 'abstain') => void;
}

export function VoteButtons({
  proposalId,
  circleSlug,
  currentVote,
  disabled,
  onVote,
}: VoteButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleVote = async (vote: 'yes' | 'no' | 'abstain') => {
    if (disabled || loading) return;
    setError('');
    setLoading(vote);

    try {
      const res = await fetch(`/api/circles/${circleSlug}/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to vote');
      }

      onVote(vote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setLoading(null);
    }
  };

  const votes: Array<{
    value: 'yes' | 'no' | 'abstain';
    icon: typeof ThumbsUp;
    label: string;
    color: 'teal' | 'red' | 'storm';
  }> = [
    { value: 'yes', icon: ThumbsUp, label: 'Yes', color: 'teal' },
    { value: 'no', icon: ThumbsDown, label: 'No', color: 'red' },
    { value: 'abstain', icon: Minus, label: 'Abstain', color: 'storm' },
  ];

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="flex gap-2">
        {votes.map(({ value, icon: Icon, label, color }) => {
          const isSelected = currentVote === value;
          const isLoading = loading === value;

          const colorClasses = {
            teal: isSelected
              ? 'bg-teal text-white'
              : 'bg-teal/10 text-teal hover:bg-teal/20',
            red: isSelected
              ? 'bg-red-500 text-white'
              : 'bg-red-100 dark:bg-red-900/20 text-red-500 hover:bg-red-200',
            storm: isSelected
              ? 'bg-storm dark:bg-foam/80 text-white dark:text-storm'
              : 'bg-gray-100 text-storm-light dark:text-dark-text-secondary hover:bg-gray-200',
          };

          return (
            <motion.button
              key={value}
              onClick={() => handleVote(value)}
              disabled={disabled || loading !== null}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${colorClasses[color]}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              {label}
            </motion.button>
          );
        })}
      </div>

      {currentVote && (
        <p className="text-center text-sm text-storm-light dark:text-dark-text-secondary">
          You voted: <span className="font-medium capitalize">{currentVote}</span>
        </p>
      )}
    </div>
  );
}
