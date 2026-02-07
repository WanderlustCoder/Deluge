'use client';

import Link from 'next/link';

interface AdvocateCardProps {
  advocate: {
    id: string;
    bio?: string | null;
    region?: string | null;
    interests?: string | null;
    user: {
      id: string;
      name: string | null;
      avatarUrl?: string | null;
    };
  };
}

export function AdvocateCard({ advocate }: AdvocateCardProps) {
  const interests = advocate.interests?.split(',').filter(Boolean) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center text-ocean-600 dark:text-ocean-400 font-bold text-lg flex-shrink-0">
          {advocate.user.avatarUrl ? (
            <img
              src={advocate.user.avatarUrl}
              alt={advocate.user.name || ''}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            advocate.user.name?.charAt(0).toUpperCase() || '?'
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {advocate.user.name}
          </h3>

          {advocate.region && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {advocate.region}
            </p>
          )}

          {advocate.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
              {advocate.bio}
            </p>
          )}

          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
