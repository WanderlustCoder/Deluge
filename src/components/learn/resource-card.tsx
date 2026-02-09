'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Video, FileText, Wrench, FileSpreadsheet, BookHeart, Clock } from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    format: string;
    estimatedMinutes: number | null;
    imageUrl: string | null;
  };
}

const FORMAT_ICONS: { [key: string]: React.ElementType } = {
  article: FileText,
  video: Video,
  guide: BookOpen,
  tool: Wrench,
  worksheet: FileSpreadsheet,
  story: BookHeart,
};

const FORMAT_LABELS: { [key: string]: string } = {
  article: 'Article',
  video: 'Video',
  guide: 'Guide',
  tool: 'Tool',
  worksheet: 'Worksheet',
  story: 'Story',
};

const CATEGORY_COLORS: { [key: string]: string } = {
  giving: 'bg-teal/10 text-teal',
  financial: 'bg-gold/10 text-gold',
  impact: 'bg-sky/10 text-sky',
  community: 'bg-ocean/10 text-ocean',
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const FormatIcon = FORMAT_ICONS[resource.format] || BookOpen;

  return (
    <Link
      href={`/learn/${resource.slug}`}
      className="block bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-ocean/20 to-teal/20">
        {resource.imageUrl ? (
          <Image
            src={resource.imageUrl}
            alt={resource.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FormatIcon className="w-12 h-12 text-ocean/30" />
          </div>
        )}
        {/* Format badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-dark-elevated rounded-full text-xs font-medium">
          <FormatIcon className="w-3 h-3" />
          {FORMAT_LABELS[resource.format]}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category tag */}
        <span className={`inline-block px-2 py-0.5 text-xs rounded mb-2 ${CATEGORY_COLORS[resource.category] || 'bg-gray-100'}`}>
          {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
        </span>

        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{resource.title}</h3>
        <p className="text-sm text-storm/60 line-clamp-2 mb-3">
          {resource.description}
        </p>

        {/* Time estimate (optional) */}
        {resource.estimatedMinutes && (
          <div className="flex items-center gap-1 text-xs text-storm/50">
            <Clock className="w-3 h-3" />
            ~{resource.estimatedMinutes} min read
          </div>
        )}
      </div>
    </Link>
  );
}
