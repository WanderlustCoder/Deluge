'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, TrendingUp, Clock, Target, ChevronRight } from 'lucide-react';
import { RecommendationCard } from '@/components/discover/recommendation-card';
import { ChallengeCard } from '@/components/discover/challenge-card';

interface Recommendation {
  id: string;
  type: string;
  score: number;
  reason: string;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    fundingGoal: number;
    fundingRaised: number;
    progress: number;
    backerCount: number;
    imageUrl: string | null;
    location: string;
    communities: Array<{ name: string; slug: string }>;
  };
}

interface Challenge {
  id: string;
  type: string;
  target: number;
  progress: number;
  percentComplete: number;
  reward: string;
  rewardAmount: number | null;
  expiresAt: string;
}

const TABS = [
  { id: 'for-you', label: 'For You', icon: Sparkles },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('for-you');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/discover/for-you';
      if (activeTab === 'nearby') endpoint = '/api/discover/nearby';
      else if (activeTab === 'trending') endpoint = '/api/discover/trending';
      else if (activeTab === 'new') endpoint = '/api/discover/new';

      const [recRes, challengeRes] = await Promise.all([
        fetch(endpoint),
        activeTab === 'for-you' ? fetch('/api/discover/challenges') : null,
      ]);

      const recData = await recRes.json();
      setRecommendations(recData.recommendations || []);

      if (challengeRes) {
        const challengeData = await challengeRes.json();
        setChallenges(challengeData.active || []);
      }
    } catch (error) {
      console.error('Error fetching discover data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean to-teal text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-white/80">
            Find projects that match your interests and make an impact
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white dark:bg-dark-elevated sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-ocean text-ocean font-medium'
                    : 'border-transparent text-storm/60 hover:text-storm'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-storm/30 mx-auto mb-4" />
                <h2 className="text-lg font-medium mb-2">No recommendations yet</h2>
                <p className="text-storm/60 mb-4">
                  Start exploring and funding projects to get personalized recommendations
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
                >
                  Browse Projects
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Active Challenges */}
            {challenges.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Your Challenges
                  </h2>
                </div>
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-4">
              <h3 className="font-medium mb-3">Explore More</h3>
              <div className="space-y-2">
                <Link
                  href="/account/preferences"
                  className="block px-3 py-2 text-sm text-storm/70 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Update your preferences →
                </Link>
                <Link
                  href="/communities"
                  className="block px-3 py-2 text-sm text-storm/70 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Join communities →
                </Link>
                <Link
                  href="/projects"
                  className="block px-3 py-2 text-sm text-storm/70 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Browse all projects →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
