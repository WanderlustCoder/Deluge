'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Gift, Users, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OccasionCardProps {
  occasion: {
    id: string;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    startDate: string;
    endDate: string;
    imageUrl: string | null;
    iconName: string | null;
    color: string | null;
    matchingBonus: number | null;
  };
}

export function OccasionCard({ occasion }: OccasionCardProps) {
  const now = new Date();
  const startDate = new Date(occasion.startDate);
  const endDate = new Date(occasion.endDate);
  const isActive = startDate <= now && endDate >= now;
  const isUpcoming = startDate > now;

  const getTypeIcon = () => {
    switch (occasion.type) {
      case 'holiday':
        return <Gift className="w-5 h-5" />;
      case 'awareness':
        return <Users className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (occasion.type) {
      case 'holiday':
        return 'Holiday';
      case 'awareness':
        return 'Awareness';
      case 'disaster':
        return 'Emergency';
      case 'personal':
        return 'Personal';
      case 'local':
        return 'Local';
      default:
        return occasion.type;
    }
  };

  return (
    <Link href={`/occasions/${occasion.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-dark-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {occasion.imageUrl && (
          <div className="h-32 relative overflow-hidden">
            <img
              src={occasion.imageUrl}
              alt={occasion.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${occasion.color || '#0D47A1'}20` }}
              >
                <span style={{ color: occasion.color || '#0D47A1' }}>
                  {getTypeIcon()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-storm dark:text-dark-text">
                  {occasion.name}
                </h3>
                <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                  {getTypeLabel()}
                </p>
              </div>
            </div>

            {isActive && (
              <span className="px-2 py-0.5 bg-teal/10 text-teal text-xs font-medium rounded-full">
                Active
              </span>
            )}
            {isUpcoming && (
              <span className="px-2 py-0.5 bg-ocean/10 dark:bg-sky/10 text-ocean dark:text-sky text-xs font-medium rounded-full">
                Upcoming
              </span>
            )}
          </div>

          {occasion.description && (
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-3 line-clamp-2">
              {occasion.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-storm-light dark:text-dark-text-secondary">
              {isActive
                ? `Ends ${formatDistanceToNow(endDate, { addSuffix: true })}`
                : isUpcoming
                ? `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`
                : 'Ended'}
            </span>

            {occasion.matchingBonus && (
              <span className="flex items-center gap-1 text-teal font-medium">
                <DollarSign className="w-4 h-4" />
                +{(occasion.matchingBonus * 100).toFixed(0)}% Match
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
