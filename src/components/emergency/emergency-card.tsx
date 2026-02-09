'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Users, DollarSign, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyCampaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  location: string | null;
  startDate: string;
  targetAmount: number | null;
  currentAmount: number;
  backerCount: number;
  priority: number;
  status: string;
}

interface EmergencyCardProps {
  emergency: EmergencyCampaign;
  featured?: boolean;
}

export function EmergencyCard({ emergency, featured }: EmergencyCardProps) {
  const progress =
    emergency.targetAmount && emergency.targetAmount > 0
      ? Math.min(100, (emergency.currentAmount / emergency.targetAmount) * 100)
      : 0;

  const getTypeColor = () => {
    switch (emergency.type) {
      case 'natural_disaster':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'crisis':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'humanitarian':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'text-gold bg-gold/10';
    }
  };

  const getTypeLabel = () => {
    switch (emergency.type) {
      case 'natural_disaster':
        return 'Natural Disaster';
      case 'crisis':
        return 'Crisis';
      case 'humanitarian':
        return 'Humanitarian';
      default:
        return 'Emergency';
    }
  };

  return (
    <Link href={`/emergency/${emergency.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`bg-white dark:bg-dark-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
          featured ? 'border-2 border-red-500/30' : ''
        }`}
      >
        {featured && (
          <div className="bg-red-500 text-white px-4 py-1 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Urgent Response Needed
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor()}`}>
                {getTypeLabel()}
              </span>
              <h3 className="font-semibold text-lg text-storm dark:text-dark-text mt-2">
                {emergency.title}
              </h3>
            </div>
            {emergency.priority > 5 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-500 text-xs font-medium rounded-full">
                High Priority
              </span>
            )}
          </div>

          {emergency.location && (
            <div className="flex items-center gap-1 text-sm text-storm-light dark:text-dark-text-secondary mb-3">
              <MapPin className="w-4 h-4" />
              {emergency.location}
            </div>
          )}

          <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-4 line-clamp-2">
            {emergency.description}
          </p>

          {/* Progress */}
          {emergency.targetAmount && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-teal">
                  ${emergency.currentAmount.toLocaleString()}
                </span>
                <span className="text-storm-light dark:text-dark-text-secondary">
                  of ${emergency.targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-teal rounded-full"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-storm-light dark:text-dark-text-secondary">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {emergency.backerCount} donors
              </span>
              <span>
                Started {formatDistanceToNow(new Date(emergency.startDate), { addSuffix: true })}
              </span>
            </div>

            <span className="flex items-center gap-1 text-ocean dark:text-sky font-medium text-sm">
              Donate <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
