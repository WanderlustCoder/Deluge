'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/i18n/formatting';

interface Story {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: { type: string; content?: string; url?: string }[];
  type: string;
  authorName?: string;
  authorRole?: string;
  mediaUrls: string[];
  videoUrl?: string;
  quotes: string[];
  impactMetrics: Record<string, number>;
  location?: string;
  tags: string[];
  viewCount: number;
  shareCount: number;
  publishedAt: string;
  project?: { id: string; title: string };
  community?: { id: string; name: string };
}

export default function StoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stories/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setStory(data.story);
        }
      } catch (error) {
        console.error('Error loading story:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function handleShare(platform: string) {
    await fetch(`/api/stories/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(story?.title || '');

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-2/3" />
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-storm dark:text-dark-text mb-4">Story Not Found</h1>
        <Link href="/stories" className="text-ocean dark:text-sky hover:underline">
          Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Image */}
      {story.mediaUrls[0] && (
        <div className="h-96 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.mediaUrls[0]}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <span className="inline-block px-3 py-1 bg-teal text-white text-sm rounded mb-4">
                {story.type}
              </span>
              <h1 className="text-4xl font-bold text-white">{story.title}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/stories"
          className="text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky mb-6 inline-block"
        >
          ← Back to Stories
        </Link>

        {/* Title (if no hero) */}
        {!story.mediaUrls[0] && (
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-teal/10 text-teal text-sm rounded mb-4">
              {story.type}
            </span>
            <h1 className="text-4xl font-bold text-ocean dark:text-sky">{story.title}</h1>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-storm-light dark:text-dark-text-secondary">
          {story.authorName && (
            <span>
              By <strong className="text-storm dark:text-dark-text">{story.authorName}</strong>
              {story.authorRole && ` (${story.authorRole})`}
            </span>
          )}
          {story.publishedAt && (
            <span>{formatDate(story.publishedAt)}</span>
          )}
          {story.location && <span>{story.location}</span>}
          <span>{story.viewCount} views</span>
        </div>

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-storm-light dark:text-dark-text-secondary mb-8 leading-relaxed"
        >
          {story.summary}
        </motion.p>

        {/* Impact Metrics */}
        {Object.keys(story.impactMetrics).length > 0 && (
          <div className="bg-teal/10 dark:bg-teal/20 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-teal mb-4">Impact Highlights</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(story.impactMetrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold text-ocean dark:text-sky">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-sm text-storm-light dark:text-dark-text-secondary capitalize">
                    {key.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Blocks */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          {story.content.map((block, i) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="text-storm-light dark:text-dark-text-secondary mb-4">
                  {block.content}
                </p>
              );
            }
            if (block.type === 'heading') {
              return (
                <h2 key={i} className="text-2xl font-bold text-ocean dark:text-sky mt-8 mb-4">
                  {block.content}
                </h2>
              );
            }
            if (block.type === 'image' && block.url) {
              return (
                <figure key={i} className="my-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.url} alt={block.content || `Image from ${story.title}`} className="rounded-lg w-full" />
                </figure>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote
                  key={i}
                  className="border-l-4 border-teal pl-4 my-6 italic text-storm-light dark:text-dark-text-secondary"
                >
                  {block.content}
                </blockquote>
              );
            }
            return null;
          })}
        </div>

        {/* Pull Quotes */}
        {story.quotes.length > 0 && (
          <div className="space-y-4 mb-8">
            {story.quotes.map((quote, i) => (
              <blockquote
                key={i}
                className="text-xl italic text-center text-storm-light dark:text-dark-text-secondary border-y border-gray-200 py-6"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        )}

        {/* Video */}
        {story.videoUrl && (
          <div className="mb-8">
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
              <iframe
                src={story.videoUrl}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {story.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-dark-border text-storm-light dark:text-dark-text-secondary rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related */}
        <div className="flex flex-wrap gap-4 mb-8">
          {story.project && (
            <Link
              href={`/projects/${story.project.id}`}
              className="px-4 py-2 bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-sky rounded-lg hover:bg-ocean/20"
            >
              View Project: {story.project.title}
            </Link>
          )}
          {story.community && (
            <Link
              href={`/communities/${story.community.id}`}
              className="px-4 py-2 bg-teal/10 text-teal dark:bg-teal/20 rounded-lg hover:bg-teal/20"
            >
              View Community: {story.community.name}
            </Link>
          )}
        </div>

        {/* Share */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-storm-light dark:text-dark-text-secondary mb-3">
            Share this story ({story.shareCount} shares)
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="px-4 py-2 bg-sky text-white rounded-lg hover:bg-sky/90"
            >
              Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
            >
              Facebook
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-border text-storm dark:text-dark-text rounded-lg hover:bg-gray-200"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
