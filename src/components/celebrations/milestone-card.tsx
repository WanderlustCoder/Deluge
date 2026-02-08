'use client';

import { motion } from 'framer-motion';
import { getMilestoneDefinition } from '@/lib/celebrations/definitions';

interface Milestone {
  id: string;
  entityType: string;
  entityId: string;
  milestoneType: string;
  title: string;
  description: string;
  reachedAt: string;
  celebratedAt?: string;
  sharedAt?: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onCelebrate?: () => void;
  onShare?: () => void;
}

export function MilestoneCard({
  milestone,
  onCelebrate,
  onShare,
}: MilestoneCardProps) {
  const definition = getMilestoneDefinition(
    milestone.milestoneType,
    milestone.entityType as 'user' | 'community'
  );

  const isNew = !milestone.celebratedAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-5 rounded-xl border ${
        isNew
          ? 'bg-gradient-to-br from-ocean/10 to-teal/10 border-ocean/30'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
      }`}
    >
      {isNew && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-ocean text-white text-xs rounded-full">
          New!
        </span>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-ocean to-teal rounded-full flex items-center justify-center text-white text-2xl">
          {getMilestoneIcon(milestone.milestoneType)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {milestone.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {definition?.message || milestone.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {new Date(milestone.reachedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {(onCelebrate || onShare) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {isNew && onCelebrate && (
            <button
              onClick={onCelebrate}
              className="flex-1 py-2 text-sm bg-ocean text-white rounded-lg hover:bg-ocean/90"
            >
              Celebrate!
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className={`${
                isNew ? 'flex-1' : 'w-full'
              } py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600`}
            >
              Share
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function getMilestoneIcon(type: string): string {
  const icons: Record<string, string> = {
    first_contribution: '\ud83c\udf31',
    first_cascade: '\ud83c\udf0a',
    projects_5: '\u2b50',
    projects_10: '\ud83c\udf1f',
    projects_25: '\ud83c\udfc6',
    projects_50: '\ud83d\udc8e',
    categories_3: '\ud83c\udf08',
    first_community: '\ud83c\udfe1',
    first_completed: '\u2705',
    anniversary_1: '\ud83c\udf82',
    anniversary_2: '\ud83c\udf89',
    referral_first: '\ud83e\udd1d',
    // Community
    first_funded: '\ud83c\udf89',
    members_10: '\ud83d\udc65',
    members_25: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',
    members_50: '\ud83c\udf0d',
    members_100: '\ud83c\udfd9\ufe0f',
    funding_1k: '\ud83d\udcb0',
    funding_5k: '\ud83d\udcb8',
    funding_10k: '\ud83d\udcb3',
    funding_25k: '\ud83c\udfc5',
    joint_project: '\ud83e\udd1d',
  };

  return icons[type] || '\u2728';
}

interface MilestoneListProps {
  milestones: Milestone[];
  onCelebrate?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function MilestoneList({
  milestones,
  onCelebrate,
  onShare,
}: MilestoneListProps) {
  if (milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-3xl mb-2">\ud83c\udf1f</div>
        <p>Your journey is just beginning!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          onCelebrate={onCelebrate ? () => onCelebrate(milestone.id) : undefined}
          onShare={onShare ? () => onShare(milestone.id) : undefined}
        />
      ))}
    </div>
  );
}
