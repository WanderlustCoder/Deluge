'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Journey {
  id: string;
  name: string;
  description: string;
  purpose: string;
  imageUrl?: string;
  targetType?: string;
  targetValue?: number;
  currentValue: number;
  visibility: string;
  status: string;
  memberCount: number;
  myRole: string;
  createdAt: string;
}

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [publicJourneys, setPublicJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchJourneys();
  }, []);

  async function fetchJourneys() {
    try {
      const [myRes, publicRes] = await Promise.all([
        fetch('/api/celebrations/journeys'),
        fetch('/api/celebrations/journeys?public=true'),
      ]);

      if (myRes.ok) {
        const data = await myRes.json();
        setJourneys(data);
      }

      if (publicRes.ok) {
        const data = await publicRes.json();
        setPublicJourneys(data);
      }
    } catch (error) {
      console.error('Error fetching journeys:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(journeyId: string) {
    try {
      const res = await fetch('/api/celebrations/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', journeyId }),
      });

      if (res.ok) {
        fetchJourneys();
      }
    } catch (error) {
      console.error('Error joining journey:', error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Shared Journeys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Work toward shared purposes with others
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
        >
          Start a Journey
        </button>
      </div>

      {/* My Journeys */}
      {journeys.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            My Journeys
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {journeys.map((journey, index) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                index={index}
                isJoined
              />
            ))}
          </div>
        </section>
      )}

      {/* Discover Journeys */}
      {publicJourneys.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Discover Journeys
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {publicJourneys
              .filter((pj) => !journeys.some((j) => j.id === pj.id))
              .map((journey, index) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  index={index}
                  onJoin={() => handleJoin(journey.id)}
                />
              ))}
          </div>
        </section>
      )}

      {journeys.length === 0 && publicJourneys.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">\ud83c\udf1f</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No journeys yet.
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start a shared journey to work toward a common purpose together.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            Start the First Journey
          </button>
        </div>
      )}

      {/* Create Modal - simplified placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Start a Journey
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Journey creation form coming soon.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function JourneyCard({
  journey,
  index,
  isJoined,
  onJoin,
}: {
  journey: Journey;
  index: number;
  isJoined?: boolean;
  onJoin?: () => void;
}) {
  const progressPercent = journey.targetValue
    ? Math.min(100, (journey.currentValue / journey.targetValue) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:border-ocean dark:hover:border-ocean transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {journey.name}
        </h3>
        {journey.status === 'completed' && (
          <span className="text-green-500 text-sm">\u2714 Complete</span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {journey.purpose}
      </p>

      {journey.targetValue && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ocean to-teal rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {journey.memberCount} traveler{journey.memberCount !== 1 ? 's' : ''}
        </span>
        {isJoined ? (
          <Link
            href={`/journeys/${journey.id}`}
            className="text-sm text-ocean hover:underline"
          >
            View Journey
          </Link>
        ) : (
          <button
            onClick={onJoin}
            className="text-sm px-3 py-1 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            Join
          </button>
        )}
      </div>
    </motion.div>
  );
}
