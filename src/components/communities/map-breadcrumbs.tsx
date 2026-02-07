"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

interface Breadcrumb {
  id: string;
  name: string;
  slug: string;
  level: string | null;
}

interface MapBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  current?: {
    name: string;
    level: string | null;
  };
}

// Display names for levels
const LEVEL_LABELS: Record<string, string> = {
  country: "Country",
  state: "State",
  county: "County",
  city: "City",
  district: "District",
  neighborhood: "Neighborhood",
};

export function MapBreadcrumbs({ breadcrumbs, current }: MapBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
      {/* Root link */}
      <Link
        href="/communities/map"
        className="flex items-center gap-1 text-storm-light hover:text-ocean transition-colors whitespace-nowrap"
      >
        <MapPin className="h-4 w-4" />
        <span>Map</span>
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbs.map((crumb) => (
        <div key={crumb.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <Link
            href={`/communities/map/${crumb.slug}`}
            className="text-storm-light hover:text-ocean transition-colors whitespace-nowrap"
          >
            {crumb.name}
          </Link>
        </div>
      ))}

      {/* Current item (not a link) */}
      {current && (
        <div className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-storm whitespace-nowrap">
            {current.name}
          </span>
          {current.level && (
            <span className="text-xs text-storm-light bg-gray-100 px-1.5 py-0.5 rounded">
              {LEVEL_LABELS[current.level] || current.level}
            </span>
          )}
        </div>
      )}
    </nav>
  );
}
