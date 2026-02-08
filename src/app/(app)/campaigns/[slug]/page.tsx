'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CampaignProgress } from '@/components/campaigns/campaign-progress';
import { RewardCard } from '@/components/campaigns/reward-card';
import { BackerWall } from '@/components/campaigns/backer-wall';
import { useToast } from '@/components/ui/toast';

interface StretchGoal {
  amount: number;
  title: string;
  description: string;
  unlocked?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  amount: number;
  quantity: number | null;
  claimed: number;
  estimatedDelivery: string | null;
  deliveryType: string;
  shippingRequired: boolean;
  imageUrl: string | null;
  activePledgeCount: number;
  isSoldOut: boolean;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  story: string | null;
  videoUrl: string | null;
  coverImageUrl: string | null;
  goalAmount: number;
  pledgedAmount: number;
  backerCount: number;
  fundingType: string;
  status: string;
  startDate: string;
  endDate: string;
  fundedAt: string | null;
  stretchGoals: StretchGoal[];
  faqs: FAQ[];
  viewCount: number;
  shareCount: number;
  project: { id: string; title: string; category: string };
  creator: { id: string; name: string; avatarUrl: string | null };
  rewards: Reward[];
  _count: { pledges: number; comments: number };
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const toast = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'story' | 'faqs' | 'updates' | 'comments'>('story');

  useEffect(() => {
    fetchCampaign();
  }, [slug]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${slug}?trackView=true`);
      const data = await res.json();
      if (data.campaign) {
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.toast('Link copied to clipboard', 'success');
    } catch {
      toast.toast('Failed to copy link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Campaign Not Found
        </h1>
        <Link href="/campaigns" className="text-ocean hover:underline">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const endDate = new Date(campaign.endDate);
  const isEnded = endDate < new Date();

  // Get next stretch goal
  const nextGoal = campaign.stretchGoals
    .sort((a, b) => a.amount - b.amount)
    .find(g => campaign.pledgedAmount < g.amount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cover Image */}
      {campaign.coverImageUrl && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-6">
          <img
            src={campaign.coverImageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <Link href="/campaigns" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Campaigns
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{campaign.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {campaign.title}
          </h1>

          {/* Creator & Project */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              {campaign.creator.avatarUrl ? (
                <img
                  src={campaign.creator.avatarUrl}
                  alt={campaign.creator.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ocean/20 flex items-center justify-center">
                  <span className="text-ocean text-sm font-medium">
                    {campaign.creator.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-gray-600 dark:text-gray-400">
                by {campaign.creator.name}
              </span>
            </div>
            <Link
              href={`/projects/${campaign.project.id}`}
              className="text-ocean hover:underline text-sm"
            >
              {campaign.project.title}
            </Link>
          </div>

          {/* Video */}
          {campaign.videoUrl && (
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-6">
              <iframe
                src={campaign.videoUrl}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {campaign.description}
          </p>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex gap-4">
              {['story', 'faqs', 'updates', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-ocean text-ocean'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'comments' && ` (${campaign._count.comments})`}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'story' && (
            <div className="prose dark:prose-invert max-w-none">
              {campaign.story ? (
                <p className="whitespace-pre-wrap">{campaign.story}</p>
              ) : (
                <p className="text-gray-500">No story content yet.</p>
              )}
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-4">
              {campaign.faqs.length === 0 ? (
                <p className="text-gray-500">No FAQs yet.</p>
              ) : (
                campaign.faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="text-gray-500">
              Updates coming soon...
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="text-gray-500">
              Comments coming soon...
            </div>
          )}

          {/* Stretch Goals */}
          {campaign.stretchGoals.length > 0 && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Stretch Goals
              </h3>
              <div className="space-y-3">
                {campaign.stretchGoals.map((goal, index) => {
                  const isUnlocked = campaign.pledgedAmount >= goal.amount;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isUnlocked
                          ? 'bg-teal/10 border-teal'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isUnlocked ? 'text-teal' : 'text-gray-900 dark:text-white'}`}>
                          {goal.title}
                        </span>
                        <span className={`text-sm ${isUnlocked ? 'text-teal' : 'text-gray-500'}`}>
                          ${goal.amount.toLocaleString()}
                          {isUnlocked && ' - Unlocked!'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <CampaignProgress
            pledgedAmount={campaign.pledgedAmount}
            goalAmount={campaign.goalAmount}
            backerCount={campaign.backerCount}
            endDate={campaign.endDate}
            fundingType={campaign.fundingType}
            status={campaign.status}
          />

          {/* Pledge Button */}
          {campaign.status === 'active' && !isEnded && (
            <Link
              href={`/campaigns/${campaign.slug}/pledge`}
              className="block w-full px-4 py-3 bg-ocean text-white text-center rounded-lg font-medium hover:bg-ocean/90"
            >
              Back This Campaign
            </Link>
          )}

          {/* Status Messages */}
          {campaign.status === 'successful' && (
            <div className="bg-teal/10 text-teal p-4 rounded-lg text-center">
              <span className="font-medium">Campaign Successful!</span>
              <p className="text-sm mt-1">Pledges have been collected.</p>
            </div>
          )}

          {campaign.status === 'failed' && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-center">
              <span className="font-medium">Campaign Did Not Reach Goal</span>
              <p className="text-sm mt-1">No pledges were collected.</p>
            </div>
          )}

          {/* Next Stretch Goal */}
          {nextGoal && campaign.status === 'active' && (
            <div className="bg-gold/10 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Next stretch goal
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {nextGoal.title}
              </p>
              <p className="text-sm text-gold">
                ${(nextGoal.amount - campaign.pledgedAmount).toLocaleString()} to go
              </p>
            </div>
          )}

          {/* Share */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Share This Campaign
            </h3>
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Copy Link
            </button>
          </div>

          {/* Rewards */}
          {campaign.rewards.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Rewards
              </h3>
              {campaign.rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  campaignSlug={campaign.slug}
                  campaignStatus={campaign.status}
                />
              ))}
            </div>
          )}

          {/* Backer Wall */}
          <BackerWall campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
}
