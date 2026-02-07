'use client';

import Link from 'next/link';
import { Calendar, MapPin, Video, Users } from 'lucide-react';

interface AdvocateEventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    type: string;
    date: string;
    location?: string | null;
    isVirtual: boolean;
    virtualLink?: string | null;
    advocate: {
      user: {
        name: string | null;
        avatarUrl?: string | null;
      };
    };
    _count?: {
      rsvps: number;
    };
  };
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  meetup: 'Community Meetup',
  workshop: 'Workshop',
  welcome_session: 'Welcome Session',
  info_session: 'Info Session',
};

export function AdvocateEventCard({ event }: AdvocateEventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <Link href={`/advocates/events/${event.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-ocean-300 dark:hover:border-ocean-600 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-ocean-100 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-400">
                {EVENT_TYPE_LABELS[event.type] || event.type}
              </span>
              {!isUpcoming && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  Past
                </span>
              )}
            </div>

            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {event.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>

              {event.isVirtual ? (
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Virtual
                </span>
              ) : event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
              )}

              {event._count && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event._count.rsvps} RSVP{event._count.rsvps !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hosted by
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {event.advocate.user.name}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
