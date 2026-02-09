'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Target, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface CampaignHeroProps {
  campaign: {
    name: string;
    tagline: string | null;
    description: string;
    startDate: string;
    endDate: string;
    platformGoal: number | null;
    platformProgress: number;
    matchingPartner: string | null;
    matchingRatio: number | null;
    heroImageUrl: string | null;
    themeColor: string | null;
  };
  stats?: {
    projectCount: number;
    totalRaised: number;
    backerCount: number;
  } | null;
}

export function CampaignHero({ campaign, stats }: CampaignHeroProps) {
  const endDate = new Date(campaign.endDate);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );
  const themeColor = campaign.themeColor || '#0D47A1';

  const progress =
    campaign.platformGoal && campaign.platformGoal > 0
      ? Math.min(100, (campaign.platformProgress / campaign.platformGoal) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {campaign.heroImageUrl && (
        <div className="absolute inset-0">
          <img
            src={campaign.heroImageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        </div>
      )}

      <div
        className={`relative p-8 lg:p-12 ${
          campaign.heroImageUrl ? 'text-white' : ''
        }`}
        style={!campaign.heroImageUrl ? { backgroundColor: `${themeColor}10` } : undefined}
      >
        <div className="max-w-4xl">
          {campaign.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-lg mb-2 ${
                campaign.heroImageUrl ? 'text-white/80' : 'text-storm-light dark:text-dark-text-secondary'
              }`}
            >
              {campaign.tagline}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={!campaign.heroImageUrl ? { color: themeColor } : undefined}
          >
            {campaign.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg mb-6 max-w-2xl ${
              campaign.heroImageUrl ? 'text-white/90' : 'text-storm-light dark:text-dark-text-secondary'
            }`}
          >
            {campaign.description}
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-6 mb-8"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {daysRemaining > 0 ? (
                  <>
                    <strong>{daysRemaining}</strong> days left
                  </>
                ) : (
                  'Campaign ended'
                )}
              </span>
            </div>

            {campaign.matchingPartner && campaign.matchingRatio && (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-gold" />
                <span>
                  <strong>{campaign.matchingRatio}x</strong> match by {campaign.matchingPartner}
                </span>
              </div>
            )}

            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>
                    <strong>{stats.backerCount}</strong> donors
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span>
                    <strong>{stats.projectCount}</strong> projects
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Progress bar */}
          {campaign.platformGoal && campaign.platformGoal > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl"
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">
                  ${campaign.platformProgress.toLocaleString()} raised
                </span>
                <span className={campaign.heroImageUrl ? 'text-white/70' : 'text-storm/50'}>
                  ${campaign.platformGoal.toLocaleString()} goal
                </span>
              </div>
              <div
                className={`h-3 rounded-full overflow-hidden ${
                  campaign.heroImageUrl ? 'bg-white/30' : 'bg-gray-100 dark:bg-foam/10'
                }`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: campaign.heroImageUrl ? 'white' : themeColor }}
                />
              </div>
              <p
                className={`text-sm mt-2 ${
                  campaign.heroImageUrl ? 'text-white/70' : 'text-storm-light dark:text-dark-text-secondary'
                }`}
              >
                {progress.toFixed(0)}% of goal reached
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
