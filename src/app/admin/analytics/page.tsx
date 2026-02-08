'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PlatformOverview {
  totalUsers: number;
  totalProjects: number;
  totalFunded: number;
  activeLoans: number;
  weeklyAverages: Record<string, number>;
}

interface MetricHistory {
  date: Date;
  value: number;
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetrics, setActiveMetrics] = useState<MetricHistory[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setOverview(data.overview);
        setActiveMetrics(data.activeUserHistory || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Platform performance and insights</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/analytics/executive"
            className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            Executive Dashboard
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-ocean to-teal p-6 rounded-xl text-white"
        >
          <p className="text-sm opacity-80">Total Users</p>
          <p className="text-3xl font-bold">{overview?.totalUsers.toLocaleString() || 0}</p>
          {overview?.weeklyAverages.new_users && (
            <p className="text-sm opacity-80 mt-2">
              +{Math.round(overview.weeklyAverages.new_users * 7)} this week
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
          <p className="text-3xl font-bold text-storm dark:text-white">
            {overview?.totalProjects.toLocaleString() || 0}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            {overview?.totalFunded || 0} funded
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Loans</p>
          <p className="text-3xl font-bold text-storm dark:text-white">
            {overview?.activeLoans || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Daily Active</p>
          <p className="text-3xl font-bold text-storm dark:text-white">
            {Math.round(overview?.weeklyAverages.daily_active_users || 0)}
          </p>
        </motion.div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/analytics/executive"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-ocean dark:hover:border-ocean transition-colors"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Executive Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            High-level platform metrics and KPIs
          </p>
        </Link>

        <Link
          href="/admin/analytics/financial"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-ocean dark:hover:border-ocean transition-colors"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Financial Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue streams and financial health
          </p>
        </Link>

        <Link
          href="/admin/analytics/communities"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-ocean dark:hover:border-ocean transition-colors"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Dashboard</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Community health and engagement
          </p>
        </Link>
      </div>

      {/* Weekly Averages */}
      {overview?.weeklyAverages && Object.keys(overview.weeklyAverages).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-lg mb-4 dark:text-white">7-Day Averages</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(overview.weeklyAverages).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {typeof value === 'number' && value > 100
                    ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : typeof value === 'number'
                    ? value.toFixed(2)
                    : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Active Users Chart Placeholder */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-lg mb-4 dark:text-white">Daily Active Users (Last 30 Days)</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
          {activeMetrics.length > 0 ? (
            <div className="w-full h-full flex items-end justify-around px-4 pb-4">
              {activeMetrics.slice(-30).map((m, i) => (
                <div
                  key={i}
                  className="bg-teal rounded-t-sm"
                  style={{
                    width: '2%',
                    height: `${Math.max(10, (m.value / Math.max(...activeMetrics.map(x => x.value))) * 100)}%`,
                  }}
                  title={`${new Date(m.date).toLocaleDateString()}: ${m.value}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500">No data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
