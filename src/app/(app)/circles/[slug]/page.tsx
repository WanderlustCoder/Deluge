'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Plus, FileText, Activity, Users } from 'lucide-react';
import { CircleHeader } from '@/components/circles/circle-header';
import { PoolBalance } from '@/components/circles/pool-balance';
import { ContributeModal } from '@/components/circles/contribute-modal';
import { ProposalCard } from '@/components/circles/proposal-card';
import { CreateProposalModal } from '@/components/circles/create-proposal-modal';
import { ActivityFeed } from '@/components/circles/activity-feed';

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isPrivate: boolean;
  pooledBalance: number;
  totalContributed: number;
  totalDeployed: number;
  votingThreshold: number;
  votingPeriod: number;
  focusCategories: string[];
  members: Array<{
    id: string;
    userId: string;
    role: string;
    totalContributed: number;
    user: { id: string; name: string; avatarUrl: string | null };
  }>;
  _count: { proposals: number };
}

interface Stats {
  pooledBalance: number;
  totalContributed: number;
  totalDeployed: number;
  memberCount: number;
  monthlyContributions: number;
  activeProposals: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: string;
  status: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  votingEnds: string;
  projectId: string | null;
  loanId: string | null;
}

interface ActivityItem {
  id: string;
  type: string;
  actorId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
}

export default function CircleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'proposals' | 'activity' | 'members'>('proposals');
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [watershedBalance, setWatershedBalance] = useState(0);

  const isMember = circle?.members.some((m) => m.userId === session?.user?.id);
  const isAdmin = circle?.members.some(
    (m) => m.userId === session?.user?.id && (m.role === 'admin' || m.role === 'founder')
  );

  useEffect(() => {
    loadCircle();
    loadWatershed();
  }, [slug]);

  useEffect(() => {
    if (circle && tab === 'proposals') {
      loadProposals();
    } else if (circle && tab === 'activity') {
      loadActivity();
    }
  }, [circle, tab]);

  const loadCircle = async () => {
    try {
      const res = await fetch(`/api/circles/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setCircle(data.circle);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load circle:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    try {
      const res = await fetch(`/api/circles/${slug}/proposals`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch (error) {
      console.error('Failed to load proposals:', error);
    }
  };

  const loadActivity = async () => {
    try {
      const res = await fetch(`/api/circles/${slug}/activity`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const loadWatershed = async () => {
    try {
      const res = await fetch('/api/watershed');
      if (res.ok) {
        const data = await res.json();
        setWatershedBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load watershed:', error);
    }
  };

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/circles/${slug}/join`, { method: 'POST' });
      if (res.ok) {
        loadCircle();
      }
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this circle?')) return;
    try {
      const res = await fetch(`/api/circles/${slug}/join`, { method: 'DELETE' });
      if (res.ok) {
        loadCircle();
      }
    } catch (error) {
      console.error('Failed to leave:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-storm-light dark:text-dark-text-secondary">Circle not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <CircleHeader
        circle={{
          ...circle,
          memberCount: circle.members.length,
        }}
        isAdmin={isAdmin}
        isMember={isMember}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-foam/10">
            <button
              onClick={() => setTab('proposals')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                tab === 'proposals'
                  ? 'border-ocean dark:border-sky text-ocean dark:text-sky'
                  : 'border-transparent text-storm-light dark:text-dark-text-secondary hover:text-storm dark:hover:text-dark-text'
              }`}
            >
              <FileText className="w-4 h-4" />
              Proposals
              {stats?.activeProposals ? (
                <span className="px-2 py-0.5 bg-ocean/10 dark:bg-sky/10 text-ocean dark:text-sky text-xs rounded-full">
                  {stats.activeProposals}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => setTab('activity')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                tab === 'activity'
                  ? 'border-ocean dark:border-sky text-ocean dark:text-sky'
                  : 'border-transparent text-storm-light dark:text-dark-text-secondary hover:text-storm dark:hover:text-dark-text'
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity
            </button>
            <button
              onClick={() => setTab('members')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                tab === 'members'
                  ? 'border-ocean dark:border-sky text-ocean dark:text-sky'
                  : 'border-transparent text-storm-light dark:text-dark-text-secondary hover:text-storm dark:hover:text-dark-text'
              }`}
            >
              <Users className="w-4 h-4" />
              Members
            </button>
          </div>

          {/* Tab Content */}
          {tab === 'proposals' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {isMember && (
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 dark:border-foam/20 rounded-xl text-storm-light dark:text-dark-text-secondary hover:border-ocean dark:hover:border-sky hover:text-ocean dark:hover:text-sky transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Proposal
                </button>
              )}

              {proposals.length === 0 ? (
                <div className="bg-white dark:bg-dark-border/50 rounded-xl p-8 text-center">
                  <FileText className="w-12 h-12 text-storm/30 dark:text-dark-text/30 mx-auto mb-3" />
                  <p className="text-storm-light dark:text-dark-text-secondary">
                    No proposals yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      circleSlug={slug}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'activity' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
            >
              <ActivityFeed activities={activities} />
            </motion.div>
          )}

          {tab === 'members' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-dark-border/50 rounded-xl p-6"
            >
              <div className="space-y-3">
                {circle.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-foam/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ocean/10 dark:bg-sky/10 flex items-center justify-center overflow-hidden">
                        {member.user.avatarUrl ? (
                          <img
                            src={member.user.avatarUrl}
                            alt={member.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-medium text-ocean dark:text-sky">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-storm dark:text-dark-text">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-storm-light dark:text-dark-text-secondary capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-teal">
                        ${member.totalContributed.toFixed(2)}
                      </p>
                      <p className="text-xs text-storm-light dark:text-dark-text-secondary">
                        contributed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PoolBalance
            balance={circle.pooledBalance}
            totalContributed={circle.totalContributed}
            totalDeployed={circle.totalDeployed}
            monthlyContributions={stats?.monthlyContributions}
            onContribute={isMember ? () => setShowContributeModal(true) : undefined}
          />

          {circle.focusCategories.length > 0 && (
            <div className="bg-white dark:bg-dark-border/50 rounded-xl p-6">
              <h3 className="font-semibold text-ocean dark:text-sky mb-3">
                Focus Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {circle.focusCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-ocean/10 dark:bg-sky/10 text-ocean dark:text-sky text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ContributeModal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        circleName={circle.name}
        circleSlug={slug}
        watershedBalance={watershedBalance}
        onSuccess={() => {
          loadCircle();
          loadWatershed();
        }}
      />

      <CreateProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        circleSlug={slug}
        poolBalance={circle.pooledBalance}
        onSuccess={loadProposals}
      />
    </div>
  );
}
