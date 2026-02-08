'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { CollectiveProgress } from '@/components/events/collective-progress';
import { TicketSelector } from '@/components/events/ticket-selector';

interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  format: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string | null;
  address: string | null;
  virtualUrl: string | null;
  imageUrl: string | null;
  coverImageUrl: string | null;
  goalAmount: number | null;
  raisedAmount: number;
  ticketingEnabled: boolean;
  donationsEnabled: boolean;
  capacity: number | null;
  attendeeCount: number;
  status: string;
  community: { id: string; name: string; slug: string | null };
  tickets: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    available: number | null;
    maxPerOrder: number;
    includedItems: string[];
    salesOpen: boolean;
  }>;
  sponsors: Array<{
    id: string;
    organizationName: string;
    tier: string;
    logoUrl: string | null;
    websiteUrl: string | null;
  }>;
  matches: Array<{
    id: string;
    matcherName: string;
    maxAmount: number;
    matchedAmount: number;
    ratio: number;
    message: string | null;
  }>;
  _count: {
    registrations: number;
    donations: number;
    participants: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Array<{ ticketTypeId: string; quantity: number }>>([]);

  useEffect(() => {
    fetchEvent();
  }, [params.slug]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${params.slug}?stats=true`);
      const data = await res.json();
      if (data.event) {
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Event Not Found
        </h1>
        <Link href="/events" className="text-ocean hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cover Image */}
      {event.coverImageUrl && (
        <div className="aspect-[21/9] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-6">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <Link href="/events" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Events
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {event.title}
          </h1>

          {/* Date & Location */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="material-icons">calendar_today</span>
              <span>
                {format(startDate, 'EEEE, MMMM d, yyyy')}
                <br />
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
              </span>
            </div>

            {event.venue && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="material-icons">location_on</span>
                <span>
                  {event.venue}
                  {event.address && <><br />{event.address}</>}
                </span>
              </div>
            )}

            {event.format === 'virtual' && event.virtualUrl && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="material-icons">videocam</span>
                <span>Virtual Event</span>
              </div>
            )}
          </div>

          {/* Community */}
          <div className="mb-6">
            <Link
              href={`/communities/${event.community.id}`}
              className="inline-flex items-center gap-2 text-ocean hover:underline"
            >
              <span className="material-icons text-sm">groups</span>
              {event.community.name}
            </Link>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Matching */}
          {event.matches.length > 0 && (
            <div className="bg-gradient-to-r from-gold/10 to-amber-100/50 dark:from-gold/20 dark:to-amber-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Donation Matching Active
              </h3>
              {event.matches.map((match) => (
                <div key={match.id} className="text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    <span className="font-medium">{match.matcherName}</span> is matching donations {match.ratio}:1 up to ${match.maxAmount.toLocaleString()}
                  </p>
                  {match.message && (
                    <p className="italic mt-1">&quot;{match.message}&quot;</p>
                  )}
                  <p className="text-gray-500 mt-1">
                    ${(match.maxAmount - match.matchedAmount).toLocaleString()} matching funds remaining
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Sponsors */}
          {event.sponsors.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Event Sponsors
              </h3>
              <div className="flex flex-wrap gap-4">
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center gap-2">
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.organizationName}
                        className="h-10 w-auto"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {sponsor.organizationName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          {event.goalAmount && (
            <CollectiveProgress
              raisedAmount={event.raisedAmount}
              goalAmount={event.goalAmount}
              donorCount={event._count.donations + event._count.registrations}
            />
          )}

          {/* Tickets */}
          {event.ticketingEnabled && event.status !== 'completed' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Get Tickets
              </h3>
              <TicketSelector
                tickets={event.tickets}
                onSelectionChange={setSelectedTickets}
              />
              {selectedTickets.length > 0 && (
                <Link
                  href={`/events/${event.slug}/register`}
                  className="block w-full mt-4 px-4 py-3 bg-ocean text-white text-center rounded-lg font-medium hover:bg-ocean/90"
                >
                  Continue to Registration
                </Link>
              )}
            </div>
          )}

          {/* Donate Button */}
          {event.donationsEnabled && event.status !== 'completed' && (
            <Link
              href={`/events/${event.slug}/donate`}
              className="block w-full px-4 py-3 border border-teal text-teal text-center rounded-lg font-medium hover:bg-teal/10"
            >
              Make a Donation
            </Link>
          )}

          {/* Auction Link */}
          <Link
            href={`/events/${event.slug}/auction`}
            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            View Auction Items
          </Link>

          {/* Share */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Help Spread the Word
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Share this event with friends and family
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Copy Link
            </button>
          </div>

          {/* Attendee count */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">
              {event.attendeeCount}
            </span>{' '}
            people are attending
          </div>
        </div>
      </div>
    </div>
  );
}
