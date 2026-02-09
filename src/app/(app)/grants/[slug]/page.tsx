'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  geographicFocus: string[];
  eligibility: Record<string, unknown>;
  applicationStart: string;
  applicationEnd: string;
  reviewStart?: string;
  awardDate?: string;
  reportingRequired: boolean;
  reportingFrequency?: string;
  status: string;
  applicationCount: number;
  awardCount: number;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options: string[];
    isRequired: boolean;
    section?: string;
  }>;
}

export default function GrantProgramPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [program, setProgram] = useState<GrantProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/grants/programs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProgram(data.program);
        }
      } catch (error) {
        console.error('Error loading program:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-2/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-storm dark:text-dark-text mb-4">Program Not Found</h1>
        <Link href="/grants" className="text-ocean hover:underline">
          Back to Grants
        </Link>
      </div>
    );
  }

  const isOpen = program.status === 'open';
  const deadlinePassed = new Date(program.applicationEnd) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/grants"
        className="text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky mb-6 inline-block"
      >
        ← Back to Grants
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ocean dark:text-sky">{program.name}</h1>
            <p className="text-storm-light dark:text-dark-text-secondary capitalize mt-1">
              {program.funderType} Grant Program
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm ${
              isOpen
                ? 'bg-teal/10 text-teal'
                : program.status === 'completed'
                  ? 'bg-gray-200 text-storm'
                  : 'bg-gold/10 text-gold'
            }`}
          >
            {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Key Details */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">Grant Range</p>
          <p className="text-xl font-bold text-storm dark:text-dark-text">
            ${program.minGrant.toLocaleString()} - ${program.maxGrant.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">Available Funding</p>
          <p className="text-xl font-bold text-teal">
            ${program.remainingBudget.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">Deadline</p>
          <p className="text-xl font-bold text-storm dark:text-dark-text">
            {new Date(program.applicationEnd).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">About This Program</h2>
        <p className="text-storm-light dark:text-dark-text-secondary whitespace-pre-wrap">{program.description}</p>
      </section>

      {/* Focus Areas */}
      {program.focusAreas.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">Focus Areas</h2>
          <div className="flex flex-wrap gap-2">
            {program.focusAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Geographic Focus */}
      {program.geographicFocus.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">
            Geographic Focus
          </h2>
          <div className="flex flex-wrap gap-2">
            {program.geographicFocus.map((region) => (
              <span
                key={region}
                className="px-3 py-1 bg-ocean/10 text-ocean rounded-full text-sm"
              >
                {region}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-storm-light dark:text-dark-text-secondary">Opens</div>
            <div className="font-medium text-storm dark:text-dark-text">
              {new Date(program.applicationStart).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm text-storm-light dark:text-dark-text-secondary">Deadline</div>
            <div className="font-medium text-storm dark:text-dark-text">
              {new Date(program.applicationEnd).toLocaleDateString()}
            </div>
          </div>
          {program.reviewStart && (
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-storm-light dark:text-dark-text-secondary">Review</div>
              <div className="font-medium text-storm dark:text-dark-text">
                {new Date(program.reviewStart).toLocaleDateString()}
              </div>
            </div>
          )}
          {program.awardDate && (
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-storm-light dark:text-dark-text-secondary">Awards</div>
              <div className="font-medium text-storm dark:text-dark-text">
                {new Date(program.awardDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reporting */}
      {program.reportingRequired && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-storm dark:text-dark-text mb-4">
            Reporting Requirements
          </h2>
          <p className="text-storm-light dark:text-dark-text-secondary">
            Grant recipients will be required to submit{' '}
            <span className="font-medium">{program.reportingFrequency}</span> progress reports.
          </p>
        </section>
      )}

      {/* Apply Button */}
      <div className="flex justify-center pt-8 border-t border-gray-200">
        {isOpen && !deadlinePassed ? (
          <Link href={`/grants/${slug}/apply`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-ocean text-white rounded-lg font-semibold hover:bg-ocean/90"
            >
              Start Application
            </motion.button>
          </Link>
        ) : (
          <div className="text-center">
            <p className="text-storm-light dark:text-dark-text-secondary mb-2">
              {deadlinePassed
                ? 'The application deadline has passed.'
                : 'This program is not currently accepting applications.'}
            </p>
            <Link href="/grants" className="text-ocean hover:underline">
              View Other Opportunities
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
