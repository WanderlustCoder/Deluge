'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, MapPin, Wifi, Clock, Filter, ChevronRight, Heart, Wrench } from 'lucide-react';
import { OpportunityCard } from '@/components/volunteer/opportunity-card';
import { VolunteerStats } from '@/components/volunteer/volunteer-stats';
import { VolunteerHistory } from '@/components/volunteer/volunteer-history';
import { SkillsEditor } from '@/components/volunteer/skills-editor';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  hoursNeeded: number | null;
  hoursLogged: number;
  skillsRequired: string[];
  location: string | null;
  isRemote: boolean;
  startDate: string | null;
  endDate: string | null;
  status: string;
  maxVolunteers: number | null;
  signupCount: number;
  project: {
    id: string;
    title: string;
    category: string;
  };
  isSignedUp?: boolean;
}

interface Skill {
  id: string;
  skill: string;
  category: string;
  level: string;
  description: string | null;
  isPublic: boolean;
}

interface VolunteerStatsData {
  totalHours: number;
  verifiedHours: number;
  pendingHours: number;
  opportunitiesCompleted: number;
  activeSignups: number;
}

type TabType = 'opportunities' | 'my-activity' | 'skills';

export default function VolunteerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('opportunities');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<VolunteerStatsData | null>(null);
  const [logs, setLogs] = useState<unknown[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Record<string, { label: string; icon: string }>>({});
  const [levels, setLevels] = useState<Record<string, { label: string; description: string }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'remote' | 'local'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [opportunitiesRes, logsRes, skillsRes] = await Promise.all([
        fetch('/api/volunteer/opportunities'),
        fetch('/api/volunteer/log'),
        fetch('/api/account/skills'),
      ]);

      if (opportunitiesRes.ok) {
        const data = await opportunitiesRes.json();
        setOpportunities(data.opportunities || []);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
        setStats(data.stats || null);
      }

      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setSkills(data.skills || []);
        setCategories(data.categories || {});
        setLevels(data.levels || {});
      }
    } catch (error) {
      console.error('Failed to load volunteer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (skill: { skill: string; category: string; level: string; description?: string; isPublic?: boolean }) => {
    const res = await fetch('/api/account/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skill),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add skill');
    }

    const data = await res.json();
    setSkills([...skills, data.skill]);
  };

  const handleUpdateSkill = async (id: string, updates: { level?: string; description?: string; isPublic?: boolean }) => {
    const res = await fetch('/api/account/skills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update skill');
    }

    const data = await res.json();
    setSkills(skills.map((s) => (s.id === id ? data.skill : s)));
  };

  const handleRemoveSkill = async (id: string) => {
    const res = await fetch(`/api/account/skills?id=${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to remove skill');
    }

    setSkills(skills.filter((s) => s.id !== id));
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      searchQuery === '' ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      locationFilter === 'all' ||
      (locationFilter === 'remote' && opp.isRemote) ||
      (locationFilter === 'local' && !opp.isRemote);

    return matchesSearch && matchesLocation;
  });

  const tabs = [
    { id: 'opportunities' as const, label: 'Opportunities', icon: Heart },
    { id: 'my-activity' as const, label: 'My Activity', icon: Clock },
    { id: 'skills' as const, label: 'My Skills', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-foam dark:bg-storm py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-ocean dark:text-sky mb-2">
            Volunteer
          </h1>
          <p className="text-storm/70 dark:text-foam/70">
            Give your time and skills to make a difference in your community.
          </p>
        </motion.div>

        {/* Stats Summary */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <VolunteerStats stats={stats} />
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-ocean dark:bg-sky text-white'
                  : 'bg-white dark:bg-storm/20 text-storm/70 dark:text-foam/70 hover:bg-storm/10 dark:hover:bg-foam/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/20 focus:ring-2 focus:ring-ocean dark:focus:ring-sky"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/20 hover:bg-storm/5"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2"
              >
                <button
                  onClick={() => setLocationFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    locationFilter === 'all'
                      ? 'bg-teal text-white'
                      : 'bg-storm/10 dark:bg-foam/10 hover:bg-storm/20'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLocationFilter('remote')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    locationFilter === 'remote'
                      ? 'bg-teal text-white'
                      : 'bg-storm/10 dark:bg-foam/10 hover:bg-storm/20'
                  }`}
                >
                  <Wifi className="w-3 h-3" />
                  Remote
                </button>
                <button
                  onClick={() => setLocationFilter('local')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    locationFilter === 'local'
                      ? 'bg-teal text-white'
                      : 'bg-storm/10 dark:bg-foam/10 hover:bg-storm/20'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  In-Person
                </button>
              </motion.div>
            )}

            {/* Opportunities Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-storm/20 rounded-xl p-6 animate-pulse"
                  >
                    <div className="h-4 bg-storm/10 rounded w-1/4 mb-4" />
                    <div className="h-6 bg-storm/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-storm/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-storm/20 rounded-xl">
                <Heart className="w-12 h-12 mx-auto text-storm/30 dark:text-foam/30 mb-4" />
                <h3 className="text-lg font-medium text-storm/70 dark:text-foam/70 mb-2">
                  No Opportunities Found
                </h3>
                <p className="text-sm text-storm/50 dark:text-foam/50">
                  {searchQuery || locationFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Check back soon for new volunteer opportunities'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredOpportunities.map((opportunity) => (
                  <Link
                    key={opportunity.id}
                    href={`/volunteer/${opportunity.id}`}
                  >
                    <OpportunityCard
                      opportunity={opportunity}
                      onSignup={loadData}
                    />
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* My Activity Tab */}
        {activeTab === 'my-activity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <VolunteerHistory logs={logs as never[]} />
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-2">
                Your Skills
              </h2>
              <p className="text-sm text-storm/60 dark:text-foam/60">
                Share your skills to get matched with relevant volunteer opportunities.
              </p>
            </div>

            <SkillsEditor
              skills={skills}
              categories={categories}
              levels={levels}
              onAdd={handleAddSkill}
              onUpdate={handleUpdateSkill}
              onRemove={handleRemoveSkill}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
