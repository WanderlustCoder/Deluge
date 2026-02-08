'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImageUrl: string | null;
    goalAmount: number;
    pledgedAmount: number;
    backerCount: number;
    fundingType: string;
    status: string;
    endDate: string;
    project: { id: string; title: string; category: string };
    creator: { id: string; name: string; avatarUrl: string | null };
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercent = Math.min(100, Math.round((campaign.pledgedAmount / campaign.goalAmount) * 100));
  const endDate = new Date(campaign.endDate);
  const isEnded = endDate < new Date();

  const fundingTypeLabel = {
    all_or_nothing: 'All or Nothing',
    flexible: 'Flexible',
    milestone: 'Milestone',
  }[campaign.fundingType] || campaign.fundingType;

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
        {campaign.coverImageUrl ? (
          <img
            src={campaign.coverImageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="material-icons text-4xl">campaign</span>
          </div>
        )}

        {/* Status Badge */}
        {campaign.status !== 'active' && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
            campaign.status === 'successful'
              ? 'bg-teal text-white'
              : campaign.status === 'failed'
              ? 'bg-red-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </div>
        )}

        {/* Funding Type Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
          {fundingTypeLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
          {campaign.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          by {campaign.creator.name}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-900 dark:text-white">
              ${campaign.pledgedAmount.toLocaleString()}
            </span>
            <span className="text-gray-500">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                progressPercent >= 100 ? 'bg-teal' : 'bg-ocean'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            pledged of ${campaign.goalAmount.toLocaleString()} goal
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{campaign.backerCount} backers</span>
          <span>
            {isEnded
              ? 'Ended'
              : `${formatDistanceToNow(endDate, { addSuffix: false })} left`
            }
          </span>
        </div>
      </div>
    </Link>
  );
}
