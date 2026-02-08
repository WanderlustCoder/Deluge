'use client';

import Link from 'next/link';
import { format } from 'date-fns';

interface RewardCardProps {
  reward: {
    id: string;
    title: string;
    description: string;
    amount: number;
    quantity: number | null;
    claimed: number;
    estimatedDelivery: string | null;
    deliveryType: string;
    shippingRequired: boolean;
    imageUrl: string | null;
    activePledgeCount?: number;
    isSoldOut?: boolean;
  };
  campaignSlug: string;
  campaignStatus: string;
}

export function RewardCard({ reward, campaignSlug, campaignStatus }: RewardCardProps) {
  const isSoldOut = reward.isSoldOut || (reward.quantity !== null && reward.claimed >= reward.quantity);
  const remainingQuantity = reward.quantity !== null ? reward.quantity - reward.claimed : null;
  const canSelect = campaignStatus === 'active' && !isSoldOut;

  const deliveryTypeLabel = {
    digital: 'Digital',
    physical: 'Physical',
    experience: 'Experience',
  }[reward.deliveryType] || reward.deliveryType;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${
      isSoldOut
        ? 'border-gray-300 dark:border-gray-600 opacity-60'
        : 'border-gray-200 dark:border-gray-700'
    } overflow-hidden`}>
      {/* Image */}
      {reward.imageUrl && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-700">
          <img
            src={reward.imageUrl}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Price */}
        <p className="text-lg font-bold text-ocean mb-1">
          Pledge ${reward.amount.toLocaleString()} or more
        </p>

        {/* Title */}
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {reward.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {reward.description}
        </p>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          {/* Delivery Type */}
          <div className="flex items-center gap-2">
            <span className="material-icons text-sm">
              {reward.deliveryType === 'digital' ? 'cloud_download' :
               reward.deliveryType === 'experience' ? 'celebration' : 'local_shipping'}
            </span>
            <span>{deliveryTypeLabel} delivery</span>
          </div>

          {/* Estimated Delivery */}
          {reward.estimatedDelivery && (
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm">calendar_today</span>
              <span>
                Est. delivery: {format(new Date(reward.estimatedDelivery), 'MMM yyyy')}
              </span>
            </div>
          )}

          {/* Shipping */}
          {reward.shippingRequired && (
            <div className="flex items-center gap-2">
              <span className="material-icons text-sm">local_shipping</span>
              <span>Shipping required</span>
            </div>
          )}
        </div>

        {/* Quantity */}
        {reward.quantity !== null && (
          <div className="mb-3">
            <p className="text-sm">
              <span className={`font-medium ${isSoldOut ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                {isSoldOut ? 'Sold out' : `${remainingQuantity} left`}
              </span>
              <span className="text-gray-500"> of {reward.quantity}</span>
            </p>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-ocean'}`}
                style={{ width: `${(reward.claimed / reward.quantity) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Backer count */}
        {reward.activePledgeCount !== undefined && reward.activePledgeCount > 0 && (
          <p className="text-xs text-gray-500 mb-3">
            {reward.activePledgeCount} backer{reward.activePledgeCount !== 1 ? 's' : ''}
          </p>
        )}

        {/* Select Button */}
        {canSelect ? (
          <Link
            href={`/campaigns/${campaignSlug}/pledge?reward=${reward.id}`}
            className="block w-full px-4 py-2 bg-ocean text-white text-center rounded-lg font-medium hover:bg-ocean/90"
          >
            Select This Reward
          </Link>
        ) : isSoldOut ? (
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Sold Out
          </button>
        ) : null}
      </div>
    </div>
  );
}
