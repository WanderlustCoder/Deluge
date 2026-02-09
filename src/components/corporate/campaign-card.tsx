'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Target, Gift, ChevronRight } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  targetAmount: number | null;
  currentAmount: number;
  matchingBonus: number | null;
  status: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  slug: string;
}

export function CampaignCard({ campaign, slug }: CampaignCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const now = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  const isActive = campaign.status === 'active' && now >= startDate && now <= endDate;
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const progress = campaign.targetAmount
    ? Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)
    : 0;

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 'active':
        return isActive ? (
          <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-full">
            Active
          </span>
        ) : (
          <span className="text-xs font-medium bg-gold/10 text-gold px-2 py-1 rounded-full">
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="text-xs font-medium bg-gray-100 text-storm/60 px-2 py-1 rounded-full">
            Completed
          </span>
        );
      case 'draft':
        return (
          <span className="text-xs font-medium bg-sky/10 text-sky px-2 py-1 rounded-full">
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-border/50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          {getStatusBadge()}
          <h3 className="text-lg font-semibold text-ocean dark:text-sky mt-2">
            {campaign.name}
          </h3>
          {campaign.description && (
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1 line-clamp-2">
              {campaign.description}
            </p>
          )}
        </div>
        {campaign.matchingBonus && (
          <div className="flex items-center gap-1 bg-gold/10 text-gold px-2 py-1 rounded-full">
            <Gift className="w-3 h-3" />
            <span className="text-xs font-medium">
              +{(campaign.matchingBonus * 100).toFixed(0)}% bonus
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      {campaign.targetAmount && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-storm-light dark:text-dark-text-secondary">
              {formatCurrency(campaign.currentAmount)} raised
            </span>
            <span className="font-medium text-ocean dark:text-sky">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
            Goal: {formatCurrency(campaign.targetAmount)}
          </p>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-storm-light dark:text-dark-text-secondary">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </span>
          </div>
          {isActive && daysRemaining > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{daysRemaining} days left</span>
            </div>
          )}
        </div>
        <Link
          href={`/corporate/${slug}/campaigns/${campaign.id}`}
          className="flex items-center gap-1 text-ocean dark:text-sky hover:underline"
        >
          View
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
