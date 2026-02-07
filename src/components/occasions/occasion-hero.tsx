'use client';

import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Target } from 'lucide-react';
import { format } from 'date-fns';

interface OccasionHeroProps {
  occasion: {
    name: string;
    type: string;
    description: string | null;
    startDate: string;
    endDate: string;
    imageUrl: string | null;
    color: string | null;
    matchingBonus: number | null;
  };
  stats?: {
    totalRaised: number;
    backerCount: number;
    projectCount: number;
  } | null;
}

export function OccasionHero({ occasion, stats }: OccasionHeroProps) {
  const startDate = new Date(occasion.startDate);
  const endDate = new Date(occasion.endDate);
  const themeColor = occasion.color || '#0D47A1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: `${themeColor}10` }}
    >
      {occasion.imageUrl && (
        <div className="absolute inset-0">
          <img
            src={occasion.imageUrl}
            alt={occasion.name}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}

      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
              style={{ backgroundColor: themeColor, color: 'white' }}
            >
              {occasion.type.charAt(0).toUpperCase() + occasion.type.slice(1)}
            </span>

            <h1
              className="text-3xl lg:text-4xl font-bold mb-2"
              style={{ color: themeColor }}
            >
              {occasion.name}
            </h1>

            {occasion.description && (
              <p className="text-storm/70 dark:text-foam/70 text-lg max-w-2xl mb-4">
                {occasion.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-storm/60 dark:text-foam/60">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </span>
              </div>

              {occasion.matchingBonus && (
                <div
                  className="flex items-center gap-2 font-medium"
                  style={{ color: themeColor }}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>+{(occasion.matchingBonus * 100).toFixed(0)}% Matching Active</span>
                </div>
              )}
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center">
                <div
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: themeColor }}
                >
                  ${stats.totalRaised.toLocaleString()}
                </div>
                <div className="text-sm text-storm/50 dark:text-foam/50">Raised</div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: themeColor }}
                >
                  {stats.backerCount}
                </div>
                <div className="text-sm text-storm/50 dark:text-foam/50">Backers</div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: themeColor }}
                >
                  {stats.projectCount}
                </div>
                <div className="text-sm text-storm/50 dark:text-foam/50">Projects</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
