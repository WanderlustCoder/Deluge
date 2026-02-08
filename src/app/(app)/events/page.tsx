'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { EventCard } from '@/components/events/event-card';

interface Event {
  id: string;
  slug: string;
  title: string;
  type: string;
  format: string;
  startDate: string;
  endDate: string;
  venue: string | null;
  imageUrl: string | null;
  goalAmount: number | null;
  raisedAmount: number;
  status: string;
  community: { id: string; name: string };
  attendeeCount: number;
}

const EVENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'gala', label: 'Galas' },
  { value: 'auction', label: 'Auctions' },
  { value: '5k', label: '5K / Walks' },
  { value: 'concert', label: 'Concerts' },
  { value: 'dinner', label: 'Dinners' },
  { value: 'festival', label: 'Festivals' },
  { value: 'virtual', label: 'Virtual' },
];

const FORMATS = [
  { value: '', label: 'All Formats' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('');
  const [format, setFormat] = useState('');
  const [search, setSearch] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ upcoming: 'true' });
      if (type) params.set('type', type);
      if (format) params.set('format', format);
      if (search) params.set('search', search);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [type, format, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fundraising Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Join your community at upcoming events
          </p>
        </div>
        <Link
          href="/events/create"
          className="px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
        >
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="material-icons text-4xl text-gray-400">event</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No upcoming events
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Check back later or create your own event.
          </p>
          <Link
            href="/events/create"
            className="mt-4 inline-block px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && total > 0 && (
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {events.length} of {total} events
        </p>
      )}

      {/* My Events link */}
      <div className="mt-8 text-center">
        <Link href="/events/my-events" className="text-ocean hover:underline">
          View My Events
        </Link>
      </div>
    </div>
  );
}
