'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ResourceCard } from '@/components/advocates/resource-card';
import { RESOURCE_CATEGORIES, ResourceCategory } from '@/lib/advocates/resources';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  fileUrl: string | null;
  content: string | null;
}

export default function AdvocateResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Record<string, Resource[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAdvocate, setIsAdvocate] = useState(false);

  useEffect(() => {
    checkAndFetch();
  }, []);

  const checkAndFetch = async () => {
    try {
      // Check if user is an advocate
      const advocateRes = await fetch('/api/advocates/me');
      if (advocateRes.ok) {
        const data = await advocateRes.json();
        if (!data.isAdvocate) {
          router.push('/advocates');
          return;
        }
        setIsAdvocate(true);
      } else {
        router.push('/advocates');
        return;
      }

      // Fetch resources
      const res = await fetch('/api/advocates/resources?grouped=true');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || {});
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  if (!isAdvocate) {
    return null;
  }

  const hasAnyResources = Object.values(resources).some((r) => r.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advocate Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Materials to help you be an effective advocate
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg border border-ocean-200 dark:border-ocean-800">
          <p className="text-sm text-ocean-800 dark:text-ocean-400">
            All resources are available to every advocate - no tiers or restrictions.
            Use whatever helps you in your community work.
          </p>
        </div>

        {/* Resources by Category */}
        {hasAnyResources ? (
          <div className="space-y-8">
            {RESOURCE_CATEGORIES.map((category) => {
              const categoryResources = resources[category.value] || [];
              if (categoryResources.length === 0) return null;

              return (
                <section key={category.value}>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.label}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {categoryResources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ResourceCard resource={resource} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No resources available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Check back soon for helpful materials
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
