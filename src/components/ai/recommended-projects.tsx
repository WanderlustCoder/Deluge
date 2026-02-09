'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface RecommendedProject {
  id: string;
  title: string;
  category: string;
  fundingRaised: number;
  fundingGoal: number;
  score: number;
  reasons: string[];
}

interface Props {
  type?: 'personalized' | 'similar' | 'trending';
  projectId?: string;
  limit?: number;
  title?: string;
}

export function RecommendedProjects({
  type = 'personalized',
  projectId,
  limit = 4,
  title = 'Recommended for You',
}: Props) {
  const [projects, setProjects] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ type, limit: String(limit) });
        if (projectId) params.set('projectId', projectId);

        const res = await fetch(`/api/ai/recommendations?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [type, projectId, limit]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-storm dark:text-dark-text">{title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-storm dark:text-dark-text">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 h-full cursor-pointer"
            >
              <h3 className="font-medium text-storm dark:text-dark-text mb-2 line-clamp-2">
                {project.title}
              </h3>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-storm-light dark:text-dark-text-secondary">
                    ${project.fundingRaised.toLocaleString()}
                  </span>
                  <span className="text-storm/40 dark:text-dark-text/40">
                    ${project.fundingGoal.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full"
                    style={{
                      width: `${Math.min(100, (project.fundingRaised / project.fundingGoal) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <span className="inline-block px-2 py-1 bg-ocean/10 text-ocean text-xs rounded mb-2">
                {project.category}
              </span>

              {project.reasons.length > 0 && (
                <p className="text-xs text-storm-light dark:text-dark-text-secondary line-clamp-2">
                  {project.reasons[0]}
                </p>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecommendedProjects;
