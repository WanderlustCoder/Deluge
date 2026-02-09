'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import { OccasionHero } from '@/components/occasions/occasion-hero';

interface Occasion {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  color: string | null;
  matchingBonus: number | null;
  featuredProjects: string | null;
  categories: string | null;
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
  totalRaised: number;
  backerCount: number;
  projectCount: number;
}

export default function OccasionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOccasion();
  }, [slug]);

  const loadOccasion = async () => {
    try {
      const res = await fetch(`/api/occasions/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setOccasion(data.occasion);
        setProjects(data.projects || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load occasion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!occasion) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-storm-light dark:text-dark-text-secondary">Occasion not found</p>
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
        className="inline-flex items-center gap-2 text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Occasions
      </Link>

      {/* Hero */}
      <OccasionHero occasion={occasion} stats={stats} />

      {/* Featured Projects */}
      {projects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const progress = (project.fundingRaised / project.fundingGoal) * 100;

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-dark-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <span className="text-xs text-ocean dark:text-sky font-medium">
                        {project.category}
                      </span>
                      <h3 className="font-semibold text-storm dark:text-dark-text mt-1 mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm text-storm-light dark:text-dark-text-secondary line-clamp-2 mb-3">
                        {project.description}
                      </p>

                      <div className="h-2 bg-gray-100 dark:bg-foam/10 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-teal rounded-full"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-teal">
                          ${project.fundingRaised.toLocaleString()}
                        </span>
                        <span className="text-storm-light dark:text-dark-text-secondary">
                          of ${project.fundingGoal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-dark-border/50 rounded-xl p-8 text-center"
      >
        <Gift
          className="w-12 h-12 mx-auto mb-4"
          style={{ color: occasion.color || '#0D47A1' }}
        />
        <h3 className="text-xl font-semibold text-storm dark:text-dark-text mb-2">
          Make a Gift for {occasion.name}
        </h3>
        <p className="text-storm-light dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
          Give to a project in someone&apos;s honor or memory
        </p>
        <Link
          href="/give/gift"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
        >
          <Gift className="w-5 h-5" />
          Create a Gift
        </Link>
      </motion.div>
    </div>
  );
}
