'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import { DashboardStats } from '@/components/corporate/dashboard-stats';
import { CampaignCard } from '@/components/corporate/campaign-card';

interface Stats {
  employees: number;
  activeThisMonth: number;
  totalMatched: number;
  matchedThisMonth: number;
  matchingBudget: number;
  matchingSpent: number;
  matchingRemaining: number;
  projectsSupported: number;
  activeCampaigns: number;
}

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

export default function CorporateDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        fetch(`/api/corporate/${slug}/stats`),
        fetch(`/api/corporate/${slug}/campaigns?status=active`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-storm/20 rounded-xl p-4 animate-pulse"
            >
              <div className="w-10 h-10 bg-storm/10 rounded-lg mb-3" />
              <div className="h-8 bg-storm/10 rounded w-1/2 mb-2" />
              <div className="h-4 bg-storm/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      {stats && <DashboardStats stats={stats} />}

      {/* Active Campaigns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ocean dark:text-sky">
            Active Campaigns
          </h2>
          <Link
            href={`/corporate/${slug}/campaigns`}
            className="flex items-center gap-1 text-sm text-ocean dark:text-sky hover:underline"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-storm/20 rounded-xl p-8 text-center">
            <p className="text-storm/60 dark:text-foam/60 mb-4">
              No active campaigns
            </p>
            <Link
              href={`/corporate/${slug}/campaigns/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {campaigns.slice(0, 4).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} slug={slug} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Link
          href={`/corporate/${slug}/employees`}
          className="bg-white dark:bg-storm/20 rounded-xl p-6 border border-storm/10 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-ocean dark:text-sky mb-2">
            Manage Employees
          </h3>
          <p className="text-sm text-storm/60 dark:text-foam/60">
            Invite employees and manage permissions
          </p>
        </Link>

        <Link
          href={`/corporate/${slug}/campaigns/new`}
          className="bg-white dark:bg-storm/20 rounded-xl p-6 border border-storm/10 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-ocean dark:text-sky mb-2">
            Launch Campaign
          </h3>
          <p className="text-sm text-storm/60 dark:text-foam/60">
            Create a giving campaign for your team
          </p>
        </Link>

        <Link
          href={`/corporate/${slug}/reports`}
          className="bg-white dark:bg-storm/20 rounded-xl p-6 border border-storm/10 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-ocean dark:text-sky mb-2">
            View Reports
          </h3>
          <p className="text-sm text-storm/60 dark:text-foam/60">
            Generate ESG and impact reports
          </p>
        </Link>
      </motion.div>
    </div>
  );
}
