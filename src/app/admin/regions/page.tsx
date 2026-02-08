'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Region {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  isActive?: boolean;
  launchDate?: string;
}

interface RegionLaunch {
  regionCode: string;
  status: string;
  launchDate?: string;
}

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [launches, setLaunches] = useState<RegionLaunch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/regions');
      if (res.ok) {
        const data = await res.json();
        setRegions(data);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Regions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage regional settings and launches
          </p>
        </div>
      </div>

      {/* Region Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region, index) => (
          <motion.div
            key={region.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getRegionFlag(region.code)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {region.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {region.code}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  region.code === 'US'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {region.code === 'US' ? 'Launched' : 'Planning'}
              </span>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Currency</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {region.currency}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Timezone</dt>
                <dd className="font-medium text-gray-900 dark:text-white text-right truncate max-w-32">
                  {region.timezone}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Date Format</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {region.dateFormat}
                </dd>
              </div>
            </dl>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                className="w-full text-sm text-ocean hover:text-ocean/80 font-medium"
                onClick={() => alert('Region settings coming soon')}
              >
                Configure Region
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Exchange Rates Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Exchange Rate Management
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Exchange rates are updated automatically. You can also manually set rates for specific currency pairs.
          </p>
          <button
            className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
            onClick={() => alert('Rate management coming soon')}
          >
            Manage Rates
          </button>
        </div>
      </div>
    </div>
  );
}

function getRegionFlag(code: string): string {
  const flags: Record<string, string> = {
    US: '\ud83c\uddfa\ud83c\uddf8',
    CA: '\ud83c\udde8\ud83c\udde6',
    GB: '\ud83c\uddec\ud83c\udde7',
    EU: '\ud83c\uddea\ud83c\uddfa',
    AU: '\ud83c\udde6\ud83c\uddfa',
    NZ: '\ud83c\uddf3\ud83c\uddff',
  };
  return flags[code] || '\ud83c\udf0d';
}
