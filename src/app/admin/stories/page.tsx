'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  slug: string;
  summary: string;
  type: string;
  status: string;
  featured: boolean;
  authorName?: string;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  publishedAt?: string;
  author?: { name: string; email: string };
}

interface Testimonial {
  id: string;
  content: string;
  authorName: string;
  authorTitle?: string;
  rating?: number;
  type: string;
  status: string;
  featured: boolean;
  createdAt: string;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stories' | 'testimonials'>('stories');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [storiesRes, testimonialsRes] = await Promise.all([
          fetch(`/api/admin/stories${statusFilter ? `?status=${statusFilter}` : ''}`),
          fetch('/api/admin/testimonials'),
        ]);

        if (storiesRes.ok) {
          const data = await storiesRes.json();
          setStories(data.stories);
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
  }, [statusFilter]);

  async function handleStoryAction(storyId: string, action: 'publish' | 'reject' | 'feature' | 'unfeature') {
    try {
      const res = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const updated = await res.json();
        setStories(prev => prev.map(s => (s.id === storyId ? { ...s, ...updated.story } : s)));
      }
    } catch (error) {
      console.error('Error updating story:', error);
    }
  }

  async function handleTestimonialAction(
    testimonialId: string,
    action: 'publish' | 'reject' | 'feature' | 'unfeature'
  ) {
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTestimonials(prev =>
          prev.map(t => (t.id === testimonialId ? { ...t, ...updated.testimonial } : t))
        );
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  }

  const pendingStories = stories.filter(s => s.status === 'draft');
  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-storm dark:text-dark-text">Stories & Testimonials</h1>
          <p className="text-storm-light dark:text-dark-text-secondary">
            Review and manage user-submitted stories and testimonials
          </p>
        </div>
        <div className="flex items-center gap-4">
          {pendingStories.length > 0 && (
            <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm">
              {pendingStories.length} pending stories
            </span>
          )}
          {pendingTestimonials.length > 0 && (
            <span className="px-3 py-1 bg-teal/20 text-teal rounded-full text-sm">
              {pendingTestimonials.length} pending testimonials
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('stories')}
          className={`pb-3 px-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'stories'
              ? 'border-ocean text-ocean dark:text-sky'
              : 'border-transparent text-storm-light dark:text-dark-text-secondary hover:text-storm dark:hover:text-dark-text'
          }`}
        >
          Stories ({stories.length})
        </button>
        <button
          onClick={() => setTab('testimonials')}
          className={`pb-3 px-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'testimonials'
              ? 'border-ocean text-ocean dark:text-sky'
              : 'border-transparent text-storm-light dark:text-dark-text-secondary hover:text-storm dark:hover:text-dark-text'
          }`}
        >
          Testimonials ({testimonials.length})
        </button>
      </div>

      {tab === 'stories' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated dark:border-dark-border text-storm dark:text-dark-text"
            >
              <option value="">All Statuses</option>
              <option value="draft">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Stories Table */}
          <div className="bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-storm dark:text-dark-text">
                    Story
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-storm dark:text-dark-text">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-storm dark:text-dark-text">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-storm dark:text-dark-text">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-storm dark:text-dark-text">
                    Stats
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-storm dark:text-dark-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-storm-light dark:text-dark-text-secondary">
                      No stories found.
                    </td>
                  </tr>
                ) : (
                  stories.map(story => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-storm dark:text-dark-text">{story.title}</p>
                          <p className="text-sm text-storm-light dark:text-dark-text-secondary line-clamp-1">
                            {story.summary}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-dark-border rounded text-xs text-storm dark:text-dark-text capitalize">
                          {story.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-storm-light dark:text-dark-text-secondary">
                        {story.authorName || story.author?.name || 'Anonymous'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            story.status === 'published'
                              ? 'bg-teal/20 text-teal'
                              : story.status === 'draft'
                                ? 'bg-gold/20 text-gold'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {story.status}
                        </span>
                        {story.featured && (
                          <span className="ml-2 px-2 py-1 bg-ocean/20 text-ocean dark:text-sky text-xs rounded">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-storm-light dark:text-dark-text-secondary">
                        {story.viewCount} views / {story.shareCount} shares
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/stories/${story.slug}`}
                            className="px-3 py-1 text-sm text-ocean dark:text-sky hover:underline"
                            target="_blank"
                          >
                            View
                          </Link>
                          {story.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleStoryAction(story.id, 'publish')}
                                className="px-3 py-1 bg-teal text-white text-sm rounded hover:bg-teal/90"
                              >
                                Publish
                              </button>
                              <button
                                onClick={() => handleStoryAction(story.id, 'reject')}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {story.status === 'published' && (
                            <button
                              onClick={() =>
                                handleStoryAction(story.id, story.featured ? 'unfeature' : 'feature')
                              }
                              className="px-3 py-1 bg-ocean/10 text-ocean dark:text-sky text-sm rounded hover:bg-ocean/20"
                            >
                              {story.featured ? 'Unfeature' : 'Feature'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'testimonials' && (
        <div className="space-y-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-12 text-storm-light dark:text-dark-text-secondary">
              No testimonials yet.
            </div>
          ) : (
            testimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-storm dark:text-dark-text italic mb-2">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-storm dark:text-dark-text">
                        {testimonial.authorName}
                      </span>
                      {testimonial.authorTitle && (
                        <span className="text-storm-light dark:text-dark-text-secondary">
                          {testimonial.authorTitle}
                        </span>
                      )}
                      {testimonial.rating && (
                        <span className="text-gold">{'★'.repeat(Math.round(testimonial.rating))}</span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-border rounded text-xs capitalize">
                        {testimonial.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        testimonial.status === 'published'
                          ? 'bg-teal/20 text-teal'
                          : testimonial.status === 'pending'
                            ? 'bg-gold/20 text-gold'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {testimonial.status}
                    </span>
                    {testimonial.featured && (
                      <span className="px-2 py-1 bg-ocean/20 text-ocean dark:text-sky text-xs rounded">Featured</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                  {testimonial.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleTestimonialAction(testimonial.id, 'publish')}
                        className="px-3 py-1 bg-teal text-white text-sm rounded hover:bg-teal/90"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => handleTestimonialAction(testimonial.id, 'reject')}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {testimonial.status === 'published' && (
                    <button
                      onClick={() =>
                        handleTestimonialAction(
                          testimonial.id,
                          testimonial.featured ? 'unfeature' : 'feature'
                        )
                      }
                      className="px-3 py-1 bg-ocean/10 text-ocean dark:text-sky text-sm rounded hover:bg-ocean/20"
                    >
                      {testimonial.featured ? 'Unfeature' : 'Feature'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
