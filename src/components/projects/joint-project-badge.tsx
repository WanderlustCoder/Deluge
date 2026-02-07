"use client";

import Link from "next/link";
import { Users } from "lucide-react";

interface JointProjectBadgeProps {
  communities: Array<{
    id: string;
    name: string;
  }>;
  showAll?: boolean;
}

export function JointProjectBadge({ communities, showAll = false }: JointProjectBadgeProps) {
  if (!communities || communities.length === 0) {
    return null;
  }

  // Single community - not a joint project
  if (communities.length === 1) {
    return (
      <Link
        href={`/communities/${communities[0].id}`}
        className="inline-flex items-center gap-1 px-2 py-1 bg-teal/10 text-teal text-xs rounded-full hover:bg-teal/20 transition-colors"
      >
        <Users className="h-3 w-3" />
        {communities[0].name}
      </Link>
    );
  }

  // Joint project - multiple communities
  if (showAll) {
    return (
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full font-medium">
          <Users className="h-3 w-3" />
          Joint Project
        </span>
        {communities.map((community) => (
          <Link
            key={community.id}
            href={`/communities/${community.id}`}
            className="inline-flex items-center px-2 py-1 bg-teal/10 text-teal text-xs rounded-full hover:bg-teal/20 transition-colors"
          >
            {community.name}
          </Link>
        ))}
      </div>
    );
  }

  // Compact view for cards
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full">
      <Users className="h-3 w-3" />
      <span className="font-medium">Joint Project</span>
      <span className="text-gold/70">({communities.length} communities)</span>
    </div>
  );
}
