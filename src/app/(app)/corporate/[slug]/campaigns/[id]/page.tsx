'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Target, TrendingUp, Gift } from 'lucide-react';

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
  projectIds: string[];
  communityIds: string[];
  categories: string[];
  participantCount: number;
  topProjects: Array<{
    id: string;
    title: string;
    amount: number;
  }>;
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [slug, id]);

  const loadCampaign = async () => {
    try {
      const res = await fetch(`/api/corporate/${slug}/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/4" />
        <div className="h-48 bg-gray-100 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light dark:text-dark-text-secondary mb-4">Campaign not found</p>
        <Link
          href={`/corporate/${slug}/campaigns`}
          className="text-ocean dark:text-sky hover:underline"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  const progress = campaign.targetAmount
    ? Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-teal/10 text-teal';
      case 'completed':
        return 'bg-ocean/10 text-ocean dark:bg-sky/10 dark:text-sky';
      case 'upcoming':
        return 'bg-gold/10 text-gold';
      default:
        return 'bg-gray-100 text-storm/70';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href={`/corporate/${slug}/campaigns`}
          className="flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-ocean dark:text-sky">
                {campaign.name}
              </h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
            {campaign.description && (
              <p className="text-storm-light dark:text-dark-text-secondary">
                {campaign.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      {campaign.targetAmount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">Campaign Progress</p>
              <p className="text-2xl font-bold text-ocean dark:text-sky">
                {formatCurrency(campaign.currentAmount)}
                <span className="text-sm font-normal text-storm-light dark:text-dark-text-secondary ml-2">
                  of {formatCurrency(campaign.targetAmount)} goal
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-teal">{progress.toFixed(0)}%</p>
            </div>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal to-ocean dark:to-sky rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-4">
          <div className="w-10 h-10 bg-ocean/10 dark:bg-sky/10 rounded-lg flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5 text-ocean dark:text-sky" />
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">Duration</p>
          <p className="font-medium text-storm dark:text-dark-text">
            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-4">
          <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-teal" />
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">Participants</p>
          <p className="font-medium text-storm dark:text-dark-text">
            {campaign.participantCount} employees
          </p>
        </div>

        <div className="bg-white dark:bg-dark-border/50 rounded-xl p-4">
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-gold" />
          </div>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">Total Raised</p>
          <p className="font-medium text-storm dark:text-dark-text">
            {formatCurrency(campaign.currentAmount)}
          </p>
        </div>

        {campaign.matchingBonus && (
          <div className="bg-white dark:bg-dark-border/50 rounded-xl p-4">
            <div className="w-10 h-10 bg-sky/10 rounded-lg flex items-center justify-center mb-2">
              <Gift className="w-5 h-5 text-sky" />
            </div>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">Bonus Match</p>
            <p className="font-medium text-storm dark:text-dark-text">
              +{(campaign.matchingBonus * 100).toFixed(0)}%
            </p>
          </div>
        )}
      </motion.div>

      {/* Top Projects */}
      {campaign.topProjects && campaign.topProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
        >
          <h2 className="font-semibold text-ocean dark:text-sky mb-4">
            Top Funded Projects
          </h2>
          <div className="space-y-3">
            {campaign.topProjects.map((project, index) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-foam/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-ocean/10 dark:bg-sky/10 rounded-full flex items-center justify-center text-sm font-medium text-ocean dark:text-sky">
                    {index + 1}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-storm dark:text-dark-text hover:text-ocean dark:hover:text-sky transition-colors"
                  >
                    {project.title}
                  </Link>
                </div>
                <span className="font-medium text-teal">
                  {formatCurrency(project.amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
