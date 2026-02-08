'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    type: string;
    category: string;
    price: number | null;
    images: string[];
    status: string;
    createdAt: Date | string;
    seller: { id: string; name: string };
    community: { id: string; name: string };
  };
}

const TYPE_COLORS: Record<string, string> = {
  product: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  service: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  skill: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  rental: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

export function ListingCard({ listing }: ListingCardProps) {
  const createdAt = typeof listing.createdAt === 'string'
    ? new Date(listing.createdAt)
    : listing.createdAt;

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative">
        {listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium capitalize ${TYPE_COLORS[listing.type] || 'bg-gray-100 text-gray-700'}`}>
          {listing.type}
        </span>

        {/* Free badge */}
        {listing.type === 'free' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-green-500 text-white text-xs font-medium">
            FREE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
          {listing.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {listing.category}
        </p>

        {listing.price !== null && listing.type !== 'free' && (
          <p className="text-lg font-semibold text-ocean dark:text-sky-400">
            ${listing.price.toFixed(2)}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{listing.community.name}</span>
          <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
        </div>
      </div>
    </Link>
  );
}
