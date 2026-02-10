'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdvocateEventCard } from '@/components/advocates/event-card';
import { EVENT_TYPES, EventType } from '@/lib/advocates/events';
import { isAdvocate } from '@/lib/advocates';
import { Spinner } from "@/components/ui/spinner";

interface Event {
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
}

export default function AdvocateEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsAdvocate, setUserIsAdvocate] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    fetchEvents();
    checkAdvocateStatus();
  }, [selectedType]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('type', selectedType);

      const res = await fetch(`/api/advocates/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdvocateStatus = async () => {
    try {
      const res = await fetch('/api/advocates/me');
      if (res.ok) {
        const data = await res.json();
        setUserIsAdvocate(data.isAdvocate);
      }
    } catch (error) {
      console.error('Failed to check advocate status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Community Events
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Events hosted by our community advocates
            </p>
          </div>
          {userIsAdvocate && (
            <Link
              href="/advocates/events/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          )}
        </div>

        {/* Type Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedType
                  ? 'bg-ocean-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Events
            </button>
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
            {userIsAdvocate && (
              <Link
                href="/advocates/events/new"
                className="mt-2 inline-block text-ocean-600 dark:text-ocean-400 hover:underline"
              >
                Create the first event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AdvocateEventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
