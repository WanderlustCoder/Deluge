'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { CampaignCard } from '@/components/corporate/campaign-card';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  targetAmount: number | null;
  currentAmount: number;
  matchingBonus: number | null;
  status: string;
}

export default function CampaignsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');

  useEffect(() => {
    loadCampaigns();
  }, [slug, filter]);

  const loadCampaigns = async () => {
    try {
      const url = filter === 'all'
        ? `/api/corporate/${slug}/campaigns`
        : `/api/corporate/${slug}/campaigns?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-storm/10 rounded w-1/4 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-storm/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-storm/10 rounded w-3/4 mb-4" />
              <div className="h-4 bg-storm/10 rounded w-full mb-2" />
              <div className="h-4 bg-storm/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-ocean dark:text-sky">
            Campaigns
          </h1>
          <p className="text-storm/60 dark:text-foam/60">
            Create and manage giving campaigns for your team
          </p>
        </div>
        <Link
          href={`/corporate/${slug}/campaigns/new`}
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-2"
      >
        <Filter className="w-4 h-4 text-storm/50 dark:text-foam/50 flex-shrink-0" />
        {(['all', 'active', 'upcoming', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-ocean dark:bg-sky text-white'
                : 'bg-storm/10 dark:bg-foam/10 text-storm/70 dark:text-foam/70 hover:bg-storm/20 dark:hover:bg-foam/20'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Campaigns Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-storm/20 rounded-xl p-12 text-center">
            <p className="text-storm/60 dark:text-foam/60 mb-4">
              {filter === 'all'
                ? 'No campaigns yet. Create your first campaign to engage your team.'
                : `No ${filter} campaigns.`}
            </p>
            {filter === 'all' && (
              <Link
                href={`/corporate/${slug}/campaigns/new`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} slug={slug} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
