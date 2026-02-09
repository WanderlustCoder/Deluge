'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Users } from 'lucide-react';
import { CircleCard } from '@/components/circles/circle-card';

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isPrivate: boolean;
  pooledBalance: number;
  totalDeployed: number;
  members: Array<{
    user: { id: string; name: string; avatarUrl: string | null };
  }>;
  _count: { members: number };
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'browse' | 'mine'>('mine');

  useEffect(() => {
    loadCircles();
  }, [search, tab]);

  const loadCircles = async () => {
    setLoading(true);
    try {
      if (tab === 'mine') {
        const res = await fetch('/api/circles?mine=true');
        if (res.ok) {
          const data = await res.json();
          setMyCircles(data.circles || []);
        }
      } else {
        const url = search
          ? `/api/circles?search=${encodeURIComponent(search)}`
          : '/api/circles';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCircles(data.circles || []);
        }
      }
    } catch (error) {
      console.error('Failed to load circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayCircles = tab === 'mine' ? myCircles : circles;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-ocean dark:text-sky">
            Giving Circles
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary">
            Pool resources and make collective giving decisions
          </p>
        </div>
        <Link
          href="/circles/new"
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Circle
        </Link>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={() => setTab('mine')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'mine'
              ? 'bg-ocean dark:bg-sky text-white'
              : 'text-storm-light dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-foam/10'
          }`}
        >
          My Circles
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'browse'
              ? 'bg-ocean dark:bg-sky text-white'
              : 'text-storm-light dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-foam/10'
          }`}
        >
          Browse All
        </button>
      </motion.div>

      {/* Search (browse tab only) */}
      {tab === 'browse' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40 dark:text-dark-text/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circles..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-foam/20 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text focus:ring-2 focus:ring-ocean dark:focus:ring-sky outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* Circles Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-dark-border/50 rounded-xl p-6 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              </div>
              <div className="h-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : displayCircles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-border/50 rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-ocean/10 dark:bg-sky/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-ocean dark:text-sky" />
          </div>
          {tab === 'mine' ? (
            <>
              <h3 className="text-lg font-medium text-ocean dark:text-sky mb-2">
                No Circles Yet
              </h3>
              <p className="text-storm-light dark:text-dark-text-secondary mb-6">
                Create a circle or join one to start giving together
              </p>
              <div className="flex justify-center gap-3">
                <Link
                  href="/circles/new"
                  className="px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
                >
                  Create Circle
                </Link>
                <button
                  onClick={() => setTab('browse')}
                  className="px-4 py-2 border border-gray-200 dark:border-foam/20 rounded-lg text-storm-light dark:text-dark-text-secondary hover:bg-gray-50"
                >
                  Browse Circles
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-ocean dark:text-sky mb-2">
                No Circles Found
              </h3>
              <p className="text-storm-light dark:text-dark-text-secondary mb-6">
                {search ? 'Try a different search term' : 'Be the first to create a circle!'}
              </p>
              <Link
                href="/circles/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Create Circle
              </Link>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayCircles.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
