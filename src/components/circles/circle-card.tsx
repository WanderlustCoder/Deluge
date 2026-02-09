'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, DollarSign, Target, Lock } from 'lucide-react';

interface CircleCardProps {
  circle: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isPrivate: boolean;
    pooledBalance: number;
    totalDeployed: number;
    members?: Array<{
      user: { id: string; name: string; avatarUrl: string | null };
    }>;
    _count?: { members: number };
  };
}

export function CircleCard({ circle }: CircleCardProps) {
  const memberCount = circle._count?.members || circle.members?.length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link href={`/circles/${circle.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-dark-border/50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {circle.imageUrl ? (
            <img
              src={circle.imageUrl}
              alt={circle.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ocean to-teal flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ocean dark:text-sky truncate">
                {circle.name}
              </h3>
              {circle.isPrivate && (
                <Lock className="w-4 h-4 text-storm-light dark:text-dark-text-secondary flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary line-clamp-2">
              {circle.description || 'A giving circle'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-teal">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{memberCount}</span>
            </div>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">Members</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-ocean dark:text-sky">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">{formatCurrency(circle.pooledBalance)}</span>
            </div>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">Pool</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gold">
              <Target className="w-4 h-4" />
              <span className="font-semibold">{formatCurrency(circle.totalDeployed)}</span>
            </div>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary">Deployed</p>
          </div>
        </div>

        {/* Member Avatars */}
        {circle.members && circle.members.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {circle.members.slice(0, 5).map((member, index) => (
                <div
                  key={member.user.id}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-storm bg-gray-100 flex items-center justify-center overflow-hidden"
                  style={{ zIndex: 5 - index }}
                >
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-storm-light dark:text-dark-text-secondary">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {memberCount > 5 && (
              <span className="ml-2 text-sm text-storm-light dark:text-dark-text-secondary">
                +{memberCount - 5} more
              </span>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
