'use client';

import { motion } from 'framer-motion';
import { Users, Lock, Settings, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface CircleHeaderProps {
  circle: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isPrivate: boolean;
    pooledBalance: number;
    totalContributed: number;
    totalDeployed: number;
    memberCount: number;
  };
  isAdmin?: boolean;
  isMember?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export function CircleHeader({
  circle,
  isAdmin,
  isMember,
  onJoin,
  onLeave,
}: CircleHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-storm/20 rounded-xl p-6 border border-storm/10"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Circle Image */}
        <div className="flex-shrink-0">
          {circle.imageUrl ? (
            <img
              src={circle.imageUrl}
              alt={circle.name}
              className="w-24 h-24 rounded-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-ocean to-teal flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          )}
        </div>

        {/* Circle Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-ocean dark:text-sky">
              {circle.name}
            </h1>
            {circle.isPrivate && (
              <span className="flex items-center gap-1 px-2 py-1 bg-storm/10 dark:bg-foam/10 rounded-full text-xs text-storm/70 dark:text-foam/70">
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}
          </div>

          {circle.description && (
            <p className="text-storm/60 dark:text-foam/60 mb-4 max-w-2xl">
              {circle.description}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal" />
              <span className="font-medium text-storm dark:text-foam">
                {circle.memberCount}
              </span>
              <span className="text-storm/50 dark:text-foam/50">members</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-ocean dark:text-sky" />
              <span className="font-medium text-storm dark:text-foam">
                {formatCurrency(circle.pooledBalance)}
              </span>
              <span className="text-storm/50 dark:text-foam/50">in pool</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gold">
                {formatCurrency(circle.totalDeployed)}
              </span>
              <span className="text-storm/50 dark:text-foam/50">deployed</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isAdmin && (
            <Link
              href={`/circles/${circle.slug}/settings`}
              className="p-2 rounded-lg border border-storm/20 dark:border-foam/20 hover:bg-storm/5 dark:hover:bg-foam/5 transition-colors"
            >
              <Settings className="w-5 h-5 text-storm/60 dark:text-foam/60" />
            </Link>
          )}

          {isMember ? (
            <button
              onClick={onLeave}
              className="px-4 py-2 border border-storm/20 dark:border-foam/20 rounded-lg text-storm/70 dark:text-foam/70 hover:bg-storm/5 dark:hover:bg-foam/5 transition-colors"
            >
              Leave Circle
            </button>
          ) : (
            <button
              onClick={onJoin}
              className="px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Join Circle
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
