'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Video, FileText, Wrench, FileSpreadsheet, BookHeart } from 'lucide-react';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'video' | 'callout' | 'quote';
  content: string;
  level?: number;
  items?: string[];
  url?: string;
  style?: 'info' | 'tip' | 'warning';
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: ContentBlock[];
  category: string;
  format: string;
  estimatedMinutes: number | null;
  imageUrl: string | null;
}

const FORMAT_ICONS: { [key: string]: React.ElementType } = {
  article: FileText,
  video: Video,
  guide: BookOpen,
  tool: Wrench,
  worksheet: FileSpreadsheet,
  story: BookHeart,
};

const CALLOUT_STYLES: { [key: string]: string } = {
  info: 'bg-sky/10 border-sky/30',
  tip: 'bg-teal/10 border-teal/30',
  warning: 'bg-gold/10 border-gold/30',
};

function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const level = block.level || 2;
            if (level === 1) return <h1 key={index}>{block.content}</h1>;
            if (level === 2) return <h2 key={index}>{block.content}</h2>;
            if (level === 3) return <h3 key={index}>{block.content}</h3>;
            if (level === 4) return <h4 key={index}>{block.content}</h4>;
            return <h5 key={index}>{block.content}</h5>;
          }

          case 'paragraph':
            return <p key={index}>{block.content}</p>;

          case 'list':
            return (
              <ul key={index}>
                {block.items?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case 'callout':
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${CALLOUT_STYLES[block.style || 'info']}`}
              >
                {block.content}
              </div>
            );

          case 'quote':
            return (
              <blockquote key={index} className="border-l-4 border-ocean pl-4 italic">
                {block.content}
              </blockquote>
            );

          case 'image':
            return (
              <figure key={index} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.content} className="rounded-lg" />
                {block.content && (
                  <figcaption className="text-center text-sm text-storm/60 mt-2">
                    {block.content}
                  </figcaption>
                )}
              </figure>
            );

          case 'video':
            return (
              <div key={index} className="aspect-video my-6">
                <iframe
                  src={block.url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            );

          default:
            return <p key={index}>{block.content}</p>;
        }
      })}
    </div>
  );
}

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResource();
  }, [resolvedParams.slug]);

  const fetchResource = async () => {
    try {
      const res = await fetch(`/api/learn/resources/${resolvedParams.slug}`);
      if (!res.ok) {
        setError('Resource not found');
        return;
      }
      const data = await res.json();
      setResource(data);
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50/20 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-storm/30 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">{error || 'Resource not found'}</h1>
          <Link href="/learn" className="text-ocean hover:underline">
            Back to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  const FormatIcon = FORMAT_ICONS[resource.format] || BookOpen;

  return (
    <div className="min-h-screen bg-gray-50/20">
      {/* Header */}
      <div className="bg-white dark:bg-dark-elevated border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-storm/60 hover:text-ocean mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-ocean/10 rounded-lg">
              <FormatIcon className="w-6 h-6 text-ocean" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 bg-ocean/10 text-ocean text-xs rounded">
                  {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                </span>
                {resource.estimatedMinutes && (
                  <span className="flex items-center gap-1 text-xs text-storm/50">
                    <Clock className="w-3 h-3" />
                    ~{resource.estimatedMinutes} min
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{resource.title}</h1>
              <p className="text-storm/60 mt-1">{resource.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-dark-border/50 rounded-xl p-8 border border-gray-200">
            <ContentRenderer blocks={resource.content} />
          </div>

          {/* Related resources could go here */}
          <div className="mt-8 text-center">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 text-ocean hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Explore more resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
