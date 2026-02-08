'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CampaignCard } from '@/components/campaigns/campaign-card';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  goalAmount: number;
  pledgedAmount: number;
  backerCount: number;
  fundingType: string;
  status: string;
  endDate: string;
  project: { id: string; title: string; category: string };
  creator: { id: string; name: string; avatarUrl: string | null };
  _count: { pledges: number };
}

const FUNDING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'all_or_nothing', label: 'All or Nothing' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'milestone', label: 'Milestone' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_funded', label: 'Most Funded' },
  { value: 'trending', label: 'Trending' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'active' });
      if (search) params.set('search', search);
      if (fundingType) params.set('fundingType', fundingType);
      if (sortBy) params.set('sortBy', sortBy);

      const res = await fetch(`/api/campaigns?${params.toString()}`);
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [search, fundingType, sortBy]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pledge Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Back projects you believe in - pledges are only collected when campaigns succeed
          </p>
        </div>
        <Link
          href="/campaigns/create"
          className="px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
        >
          Start a Campaign
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
              placeholder="Search campaigns..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={fundingType}
            onChange={(e) => setFundingType(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            {FUNDING_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="material-icons text-4xl text-gray-400">campaign</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No active campaigns
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Be the first to start a campaign!
          </p>
          <Link
            href="/campaigns/create"
            className="mt-4 inline-block px-4 py-2 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90"
          >
            Start a Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && total > 0 && (
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {campaigns.length} of {total} campaigns
        </p>
      )}

      {/* My Campaigns link */}
      <div className="mt-8 text-center space-x-4">
        <Link href="/pledges" className="text-ocean hover:underline">
          My Pledges
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/campaigns/my-campaigns" className="text-ocean hover:underline">
          My Campaigns
        </Link>
      </div>
    </div>
  );
}
