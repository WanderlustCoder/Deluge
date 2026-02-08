'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Users, MapPin, Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    score: number;
    reason: string;
    project: {
      id: string;
      title: string;
      description: string;
      category: string;
      fundingGoal: number;
      fundingRaised: number;
      progress: number;
      backerCount: number;
      imageUrl: string | null;
      location: string;
      communities: Array<{ name: string; slug: string }>;
    };
  };
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { project, reason, score } = recommendation;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white dark:bg-storm/20 border border-storm/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-ocean/20 to-teal/20">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-12 h-12 text-ocean/30" />
          </div>
        )}
        {/* Match indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-storm/90 rounded-full text-xs font-medium">
          <Sparkles className="w-3 h-3 text-gold" />
          {Math.round(score * 100)}% match
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Reason tag */}
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky/10 text-sky text-xs rounded mb-2">
          <Sparkles className="w-3 h-3" />
          {reason}
        </div>

        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-storm/60 line-clamp-2 mb-3">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-storm/50 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project.backerCount} backers
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatCurrency(project.fundingRaised)}</span>
            <span className="text-storm/50">
              {project.progress}% of {formatCurrency(project.fundingGoal)}
            </span>
          </div>
          <div className="h-2 bg-storm/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-ocean to-teal rounded-full transition-all"
              style={{ width: `${Math.min(100, project.progress)}%` }}
            />
          </div>
        </div>

        {/* Communities */}
        {project.communities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.communities.slice(0, 2).map((c) => (
              <span
                key={c.slug}
                className="px-2 py-0.5 bg-storm/5 text-xs text-storm/60 rounded"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
