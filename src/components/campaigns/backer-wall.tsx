'use client';

import { useState, useEffect } from 'react';

interface Backer {
  id: string;
  amount: number;
  message: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface BackerWallProps {
  campaignId: string;
}

export function BackerWall({ campaignId }: BackerWallProps) {
  const [backers, setBackers] = useState<Backer[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'recent' | 'top'>('recent');

  useEffect(() => {
    fetchBackers();
  }, [campaignId, view]);

  const fetchBackers = async () => {
    try {
      // We need the campaign slug to fetch backers, but we have the ID
      // For now, we'll construct a simple endpoint
      const res = await fetch(`/api/pledges?campaignId=${campaignId}&view=${view}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setBackers(data.backers || []);
      }
    } catch (error) {
      console.error('Error fetching backers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Backers
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView('recent')}
            className={`px-2 py-1 text-xs rounded ${
              view === 'recent'
                ? 'bg-ocean text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setView('top')}
            className={`px-2 py-1 text-xs rounded ${
              view === 'top'
                ? 'bg-ocean text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Top
          </button>
        </div>
      </div>

      {backers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Be the first to back this campaign!
        </p>
      ) : (
        <div className="space-y-3">
          {backers.map((backer) => (
            <div key={backer.id} className="flex items-start gap-3">
              {/* Avatar */}
              {backer.user.avatarUrl ? (
                <img
                  src={backer.user.avatarUrl}
                  alt={backer.user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ocean/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-ocean text-xs font-medium">
                    {backer.user.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {backer.user.name}
                  </span>
                  {view === 'top' && (
                    <span className="text-xs text-gray-500">
                      ${backer.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                {backer.message && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    &ldquo;{backer.message}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
