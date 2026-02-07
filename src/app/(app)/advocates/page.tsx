'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AdvocateCard } from '@/components/advocates/advocate-card';

interface Advocate {
  id: string;
  bio: string | null;
  region: string | null;
  interests: string | null;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface Stats {
  totalActive: number;
  totalEvents: number;
  totalActivities: number;
  regions: string[];
}

export default function AdvocatesPage() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  useEffect(() => {
    fetchAdvocates();
  }, [selectedRegion]);

  const fetchAdvocates = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRegion) params.set('region', selectedRegion);

      const res = await fetch(`/api/advocates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAdvocates(data.advocates || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community Advocates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
            Meet the people who help make our communities thrive. They welcome newcomers,
            organize events, and spread the word about Deluge.
          </p>
          <div className="mt-6">
            <Link
              href="/advocates/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ocean-600 text-white font-medium hover:bg-ocean-700"
            >
              Join Us
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalActive}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Advocates</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalEvents}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Events Hosted</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.regions.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Regions Covered</p>
            </motion.div>
          </div>
        )}

        {/* Region Filter */}
        {stats && stats.regions.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRegion('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedRegion
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Regions
              </button>
              {stats.regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? 'bg-ocean-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advocates Grid */}
        {advocates.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No advocates found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Be the first to join!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advocates.map((advocate, index) => (
              <motion.div
                key={advocate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AdvocateCard advocate={advocate} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg p-6 border border-ocean-200 dark:border-ocean-800">
          <h2 className="text-lg font-semibold text-ocean-900 dark:text-ocean-300 mb-2">
            What Do Advocates Do?
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-ocean-800 dark:text-ocean-400">
            <div>
              <h3 className="font-medium text-ocean-900 dark:text-ocean-300">Welcome Newcomers</h3>
              <p>Help new community members get started and feel at home</p>
            </div>
            <div>
              <h3 className="font-medium text-ocean-900 dark:text-ocean-300">Host Events</h3>
              <p>Organize meetups, workshops, and community gatherings</p>
            </div>
            <div>
              <h3 className="font-medium text-ocean-900 dark:text-ocean-300">Spread the Word</h3>
              <p>Share Deluge with others and answer questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
