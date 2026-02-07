'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CampaignHero } from '@/components/campaigns/campaign-hero';

interface Campaign {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  startDate: string;
  endDate: string;
  platformGoal: number | null;
  platformProgress: number;
  matchingPartner: string | null;
  matchingRatio: number | null;
  heroImageUrl: string | null;
  themeColor: string | null;
  featuredProjects: string | null;
  badges: string | null;
  status: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  fundingRaised: number;
  imageUrl: string | null;
}

interface Stats {
  projectCount: number;
  totalRaised: number;
  backerCount: number;
  matchingApplied: number;
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [slug]);

  const loadCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/seasonal?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setStats(data.stats);

        // Load featured projects if any
        if (data.campaign.featuredProjects) {
          const projectIds = data.campaign.featuredProjects.split(',');
          // This would need an API endpoint to fetch multiple projects
          // For now, we'll skip this
        }
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-storm/10 rounded w-1/4" />
          <div className="h-64 bg-storm/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-storm/60 dark:text-foam/60">Campaign not found</p>
        <Link
          href="/occasions"
          className="inline-flex items-center gap-2 mt-4 text-ocean dark:text-sky hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Occasions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back Link */}
      <Link
        href="/occasions"
        className="inline-flex items-center gap-2 text-storm/60 dark:text-foam/60 hover:text-ocean dark:hover:text-sky transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Occasions
      </Link>

      {/* Hero */}
      <CampaignHero campaign={campaign} stats={stats} />

      {/* Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">
          Featured Projects
        </h2>

        <div className="bg-white dark:bg-storm/20 rounded-xl p-8 text-center">
          <p className="text-storm/60 dark:text-foam/60 mb-4">
            Browse all projects participating in this campaign
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
          >
            View All Projects
          </Link>
        </div>
      </motion.section>

      {/* How to Participate */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-ocean/5 dark:bg-sky/5 rounded-xl p-6"
      >
        <h2 className="font-semibold text-ocean dark:text-sky mb-4">
          How to Participate
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-storm/70 dark:text-foam/70">
          <div>
            <h3 className="font-medium text-storm dark:text-foam mb-1">
              1. Watch Ads
            </h3>
            <p>
              Earn watershed credits by watching ads. Every view contributes to
              your giving power.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-storm dark:text-foam mb-1">
              2. Fund Projects
            </h3>
            <p>
              Support featured projects during the campaign. Your contributions
              may be matched!
            </p>
          </div>
          <div>
            <h3 className="font-medium text-storm dark:text-foam mb-1">
              3. Share the Word
            </h3>
            <p>
              Invite friends to join. Together, we can reach our platform goal.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
