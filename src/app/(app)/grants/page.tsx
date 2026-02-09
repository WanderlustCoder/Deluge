'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/i18n/formatting';

interface GrantProgram {
  id: string;
  name: string;
  slug: string;
  description: string;
  funderType: string;
  totalBudget: number;
  remainingBudget: number;
  minGrant: number;
  maxGrant: number;
  categories: string[];
  focusAreas: string[];
  applicationStart: string;
  applicationEnd: string;
  status: string;
  applicationCount: number;
  awardCount: number;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'health', label: 'Health' },
  { value: 'community', label: 'Community Development' },
  { value: 'arts', label: 'Arts & Culture' },
];

export default function GrantsPage() {
  const [programs, setPrograms] = useState<GrantProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/grants/programs?status=open&public=true');
        if (res.ok) {
          const data = await res.json();
          setPrograms(data.programs);
        }
      } catch (error) {
        console.error('Error loading grants:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPrograms = filter
    ? programs.filter((p) => p.categories.includes(filter))
    : programs;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean dark:text-sky">Grant Opportunities</h1>
        <p className="text-storm-light dark:text-dark-text-secondary mt-2">
          Apply for funding to support your community projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-storm-light dark:text-dark-text-secondary">
            No open grant programs at this time. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <Link key={program.id} href={`/grants/${program.slug}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 h-full cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-storm dark:text-dark-text">
                      {program.name}
                    </h2>
                    <p className="text-sm text-storm-light dark:text-dark-text-secondary capitalize">
                      {program.funderType} Grant
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-teal/10 text-teal text-sm rounded-full">
                    Open
                  </span>
                </div>

                <p className="text-storm-light dark:text-dark-text-secondary mb-4 line-clamp-2">
                  {program.description}
                </p>

                {/* Grant Range */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-storm-light dark:text-dark-text-secondary">Grant Range</p>
                    <p className="font-semibold text-storm dark:text-dark-text">
                      ${program.minGrant.toLocaleString()} - ${program.maxGrant.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-storm-light dark:text-dark-text-secondary">Available</p>
                    <p className="font-semibold text-storm dark:text-dark-text">
                      ${program.remainingBudget.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Categories */}
                {program.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {program.focusAreas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-1 bg-gray-100 text-storm-light dark:text-dark-text-secondary text-xs rounded"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}

                {/* Deadline */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                    Deadline:{' '}
                    <span className="font-medium text-storm dark:text-dark-text">
                      {formatDate(program.applicationEnd)}
                    </span>
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* My Applications Link */}
      <div className="mt-8 text-center">
        <Link
          href="/grants/my-applications"
          className="text-ocean dark:text-sky hover:underline"
        >
          View My Applications →
        </Link>
      </div>
    </div>
  );
}
