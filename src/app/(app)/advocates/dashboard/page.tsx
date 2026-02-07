'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Calendar, FileText, Users } from 'lucide-react';
import { LogActivityModal } from '@/components/advocates/log-activity';
import { AdvocateEventCard } from '@/components/advocates/event-card';
import { ACTIVITY_TYPES, ActivityType } from '@/lib/advocates/activities';
import { useToast } from '@/components/ui/toast';

interface Advocate {
  id: string;
  bio: string | null;
  region: string | null;
  interests: string | null;
  status: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  location?: string | null;
  isVirtual: boolean;
  _count?: { rsvps: number };
}

export default function AdvocateDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [advocate, setAdvocate] = useState<Advocate | null>(null);
  const [activitySummary, setActivitySummary] = useState<{ total: number; byType: Record<string, number> } | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [showLogActivity, setShowLogActivity] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/advocates/me');
      if (!res.ok) {
        router.push('/advocates/join');
        return;
      }

      const data = await res.json();
      if (!data.isAdvocate) {
        router.push('/advocates/join');
        return;
      }

      setAdvocate(data.advocate);
      setActivitySummary(data.activitySummary);
      setRecentActivities(data.recentActivities || []);
      setUpcomingEvents(data.events?.upcoming || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (data: {
    type: ActivityType;
    description: string;
    communityId?: string;
  }) => {
    const res = await fetch('/api/advocates/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to log activity');
    }

    toast('Activity logged - thank you!', 'success');
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  if (!advocate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, {advocate.user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Thank you for being a community advocate
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLogActivity(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
            >
              <Plus className="w-4 h-4" />
              Log Activity
            </button>
            <Link
              href="/advocates/events/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Calendar className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            href="/advocates/events"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-ocean-300 dark:hover:border-ocean-600 transition-colors"
          >
            <Calendar className="w-6 h-6 text-ocean-600 dark:text-ocean-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Events</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse and host events</p>
          </Link>

          <Link
            href="/advocates/resources"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-ocean-300 dark:hover:border-ocean-600 transition-colors"
          >
            <FileText className="w-6 h-6 text-ocean-600 dark:text-ocean-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Resources</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Helpful materials</p>
          </Link>

          <Link
            href="/advocates/directory"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-ocean-300 dark:hover:border-ocean-600 transition-colors"
          >
            <Users className="w-6 h-6 text-ocean-600 dark:text-ocean-400 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Directory</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect with others</p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contributions */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Contributions
              </h2>
              {activitySummary ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ACTIVITY_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activitySummary.byType[type.value] || 0}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {type.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No activities logged yet
                </p>
              )}
            </section>

            {/* Recent Activities */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activities
              </h2>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => {
                    const typeInfo = ACTIVITY_TYPES.find((t) => t.value === activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-ocean-100 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-400">
                              {typeInfo?.label || activity.type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No activities yet</p>
                  <button
                    onClick={() => setShowLogActivity(true)}
                    className="mt-2 text-ocean-600 dark:text-ocean-400 hover:underline"
                  >
                    Log your first activity
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Events
                </h2>
                <Link
                  href="/advocates/events/new"
                  className="text-sm text-ocean-600 dark:text-ocean-400 hover:underline"
                >
                  Create
                </Link>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={`/advocates/events/${event.id}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming events
                </p>
              )}
            </section>

            {/* Profile */}
            <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Profile
              </h2>
              <div className="space-y-3 text-sm">
                {advocate.region && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Region:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{advocate.region}</span>
                  </div>
                )}
                {advocate.interests && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Interests:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {advocate.interests.split(',').map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  href="/advocates/profile"
                  className="block text-ocean-600 dark:text-ocean-400 hover:underline"
                >
                  Edit profile
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={showLogActivity}
        onClose={() => setShowLogActivity(false)}
        onSubmit={handleLogActivity}
      />
    </div>
  );
}
