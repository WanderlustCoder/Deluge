'use client';

import { Target, Gift, Clock } from 'lucide-react';

interface ChallengeCardProps {
  challenge: {
    id: string;
    type: string;
    target: number;
    progress: number;
    percentComplete: number;
    reward: string;
    rewardAmount: number | null;
    expiresAt: string;
  };
}

const CHALLENGE_TITLES: { [key: string]: string } = {
  explore_categories: 'Category Explorer',
  fund_new_community: 'Community Pioneer',
  support_local: 'Local Champion',
  diverse_giving: 'Diverse Giver',
  first_project: 'First Steps',
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const daysLeft = Math.ceil(
    (new Date(challenge.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const formatReward = () => {
    if (challenge.reward === 'watershed_credit' && challenge.rewardAmount) {
      return `$${challenge.rewardAmount.toFixed(2)} credit`;
    }
    return 'Badge';
  };

  return (
    <div className="bg-white dark:bg-storm/20 border border-storm/10 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gold/10 rounded-lg">
          <Target className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">
            {CHALLENGE_TITLES[challenge.type] || challenge.type}
          </h3>
          <p className="text-xs text-storm/60 mt-0.5">
            {challenge.progress} / {challenge.target}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 bg-storm/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold/70 rounded-full transition-all"
            style={{ width: `${challenge.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-storm/50">
          <Clock className="w-3 h-3" />
          {daysLeft} days left
        </div>
        <div className="flex items-center gap-1 text-gold">
          <Gift className="w-3 h-3" />
          {formatReward()}
        </div>
      </div>
    </div>
  );
}
