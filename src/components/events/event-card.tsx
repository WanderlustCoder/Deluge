'use client';

import Link from 'next/link';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    type: string;
    format: string;
    startDate: Date | string;
    endDate: Date | string;
    venue: string | null;
    imageUrl: string | null;
    goalAmount: number | null;
    raisedAmount: number;
    status: string;
    community: { id: string; name: string };
    attendeeCount: number;
  };
}

const TYPE_ICONS: Record<string, string> = {
  gala: 'stars',
  auction: 'gavel',
  '5k': 'directions_run',
  concert: 'music_note',
  dinner: 'restaurant',
  festival: 'celebration',
  virtual: 'videocam',
};

const FORMAT_BADGES: Record<string, { label: string; color: string }> = {
  in_person: { label: 'In-Person', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  virtual: { label: 'Virtual', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  hybrid: { label: 'Hybrid', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

export function EventCard({ event }: EventCardProps) {
  const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
  const progress = event.goalAmount ? Math.min((event.raisedAmount / event.goalAmount) * 100, 100) : 0;
  const formatBadge = FORMAT_BADGES[event.format] || FORMAT_BADGES.in_person;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700 relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="material-icons text-4xl">
              {TYPE_ICONS[event.type] || 'event'}
            </span>
          </div>
        )}

        {/* Format badge */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${formatBadge.color}`}>
          {formatBadge.label}
        </span>

        {/* Date overlay */}
        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-900/90 rounded px-2 py-1">
          <p className="text-xs font-semibold text-ocean">
            {format(startDate, 'MMM d')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {format(startDate, 'h:mm a')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
          {event.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {event.community.name}
          {event.venue && ` • ${event.venue}`}
        </p>

        {/* Progress bar */}
        {event.goalAmount && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Together we&apos;ve raised</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              ${event.raisedAmount.toLocaleString()}
              <span className="text-gray-500 font-normal"> of ${event.goalAmount.toLocaleString()}</span>
            </p>
          </div>
        )}

        {/* Attendee count */}
        <div className="mt-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="material-icons text-base">people</span>
          <span>{event.attendeeCount} attending</span>
        </div>
      </div>
    </Link>
  );
}
