'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Story {
  id: string;
  title: string;
  slug: string;
  summary: string;
  type: string;
  authorName?: string;
  mediaUrls: string[];
  viewCount: number;
  publishedAt: string;
  project?: { id: string; title: string };
  community?: { id: string; name: string };
}

interface Testimonial {
  id: string;
  content: string;
  authorName: string;
  authorTitle?: string;
  rating?: number;
}

const STORY_TYPES = [
  { value: '', label: 'All Stories' },
  { value: 'beneficiary', label: 'Beneficiary Stories' },
  { value: 'giver', label: 'Giver Journeys' },
  { value: 'project', label: 'Project Stories' },
  { value: 'community', label: 'Community Stories' },
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [featured, setFeatured] = useState<Story[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [storiesRes, featuredRes, testimonialsRes] = await Promise.all([
          fetch(`/api/stories${filter ? `?type=${filter}` : ''}`),
          fetch('/api/stories?featured=true&limit=3'),
          fetch('/api/testimonials?featured=true&limit=5'),
        ]);

        if (storiesRes.ok) {
          const data = await storiesRes.json();
          setStories(data.stories);
        }
        if (featuredRes.ok) {
          const data = await featuredRes.json();
          setFeatured(data.stories);
        }
        if (testimonialsRes.ok) {
          const data = await testimonialsRes.json();
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error('Error loading stories:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-storm/20 rounded w-1/3" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-storm/20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foam dark:bg-storm">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ocean to-teal text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Stories of Impact
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Real stories from real people making a difference in their communities
          </motion.p>
        </div>
      </section>

      {/* Featured Stories */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 -mt-10">
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((story, i) => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-storm/50 rounded-xl shadow-lg overflow-hidden cursor-pointer h-full"
                >
                  {story.mediaUrls[0] && (
                    <div className="h-48 bg-storm/20 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.mediaUrls[0]}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-gold text-white text-xs rounded">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-xs text-teal uppercase tracking-wide">
                      {story.type}
                    </span>
                    <h3 className="font-semibold text-lg text-storm dark:text-foam mt-1 mb-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-storm/70 dark:text-foam/70 line-clamp-2">
                      {story.summary}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Carousel */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-storm/5 dark:bg-storm/30 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-ocean dark:text-sky text-center mb-8">
              What People Are Saying
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {testimonials.map(t => (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-80 p-6 bg-white dark:bg-storm/50 rounded-xl shadow"
                >
                  <p className="text-storm dark:text-foam italic mb-4">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                      <span className="text-teal font-semibold">{t.authorName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-storm dark:text-foam text-sm">{t.authorName}</p>
                      {t.authorTitle && (
                        <p className="text-xs text-storm/60 dark:text-foam/60">{t.authorTitle}</p>
                      )}
                    </div>
                  </div>
                  {t.rating && (
                    <div className="mt-3 text-gold">
                      {'★'.repeat(Math.round(t.rating))}
                      {'☆'.repeat(5 - Math.round(t.rating))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Stories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-ocean dark:text-sky">All Stories</h2>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam"
          >
            {STORY_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 text-storm/60 dark:text-foam/60">
            No stories yet. Check back soon!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-storm/30 rounded-xl border border-storm/10 dark:border-storm/40 overflow-hidden cursor-pointer h-full"
                >
                  {story.mediaUrls[0] && (
                    <div className="h-40 bg-storm/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={story.mediaUrls[0]}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-teal uppercase tracking-wide">
                        {story.type}
                      </span>
                      <span className="text-xs text-storm/50 dark:text-foam/50">
                        {story.viewCount} views
                      </span>
                    </div>
                    <h3 className="font-semibold text-storm dark:text-foam mb-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-storm/70 dark:text-foam/70 line-clamp-2">
                      {story.summary}
                    </p>
                    {story.authorName && (
                      <p className="text-xs text-storm/50 dark:text-foam/50 mt-3">
                        By {story.authorName}
                      </p>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal to-ocean py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Have a Story to Share?</h2>
          <p className="text-white/90 mb-6">
            Whether you&apos;ve funded a project, received support, or witnessed community
            transformation, we&apos;d love to hear from you.
          </p>
          <Link
            href="/stories/submit"
            className="inline-block px-8 py-3 bg-white text-ocean rounded-lg font-semibold hover:bg-foam transition-colors"
          >
            Share Your Story
          </Link>
        </div>
      </section>
    </div>
  );
}
