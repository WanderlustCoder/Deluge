'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdvocateCard } from '@/components/advocates/advocate-card';
import { Spinner } from "@/components/ui/spinner";

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

export default function AdvocateDirectoryPage() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [regions, setRegions] = useState<string[]>([]);

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
        if (data.stats?.regions) {
          setRegions(data.stats.regions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort alphabetically by name
  const sortedAdvocates = [...advocates].sort((a, b) => {
    const nameA = a.user.name || '';
    const nameB = b.user.name || '';
    return nameA.localeCompare(nameB);
  });

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advocate Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with fellow advocates in our community
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg border border-ocean-200 dark:border-ocean-800">
          <p className="text-sm text-ocean-800 dark:text-ocean-400">
            Listed alphabetically - we don't rank our advocates. Everyone's contribution is valued equally.
          </p>
        </div>

        {/* Region Filter */}
        {regions.length > 0 && (
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
              {regions.map((region) => (
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
        {sortedAdvocates.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No advocates found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sortedAdvocates.map((advocate, index) => (
              <motion.div
                key={advocate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <AdvocateCard advocate={advocate} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
