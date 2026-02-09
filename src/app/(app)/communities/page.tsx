"use client";

import { useState, useEffect, useMemo } from "react";
import { CommunityCard } from "@/components/communities/community-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Plus, Map, Users, ChevronDown, ChevronRight, MapPin, Building2, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FilterType = "all" | "joined" | "geographic" | "interest";

// Level display configuration
const LEVEL_CONFIG: Record<string, { label: string; icon: typeof MapPin; order: number }> = {
  country: { label: "Countries", icon: MapPin, order: 0 },
  state: { label: "States", icon: MapPin, order: 1 },
  county: { label: "Counties", icon: MapPin, order: 2 },
  city: { label: "Cities", icon: Building2, order: 3 },
  district: { label: "Districts", icon: Home, order: 4 },
  neighborhood: { label: "Neighborhoods", icon: Home, order: 5 },
};

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("joined");
  const [loading, setLoading] = useState(true);

  // For geographic view - track which levels are expanded
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(["city", "neighborhood"]));

  useEffect(() => {
    setLoading(true);
    let params = "";

    if (filterType === "joined") {
      params = "?joined=true";
    } else if (filterType === "geographic" || filterType === "interest") {
      params = `?type=${filterType}`;
    }

    fetch(`/api/communities${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCommunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterType]);

  const filtered = communities.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  // Group communities by level for geographic view
  const groupedByLevel = useMemo(() => {
    if (filterType !== "geographic") return null;

    const groups: Record<string, any[]> = {};
    filtered.forEach((c) => {
      const level = c.level || "other";
      if (!groups[level]) groups[level] = [];
      groups[level].push(c);
    });

    // Sort groups by level order, filter out country/state (too high level)
    return Object.entries(groups)
      .filter(([level]) => ["county", "city", "district", "neighborhood"].includes(level))
      .sort(([a], [b]) => (LEVEL_CONFIG[a]?.order || 99) - (LEVEL_CONFIG[b]?.order || 99));
  }, [filtered, filterType]);

  // Count joined communities for the badge
  const joinedCount = communities.filter((c) => c.isMember).length;

  // Toggle level expansion
  const toggleLevel = (level: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm">
            Communities
          </h1>
          <p className="text-storm-light mt-1">
            Join communities around your neighborhood or causes you care about.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/communities/map">
            <Button variant="outline" size="sm">
              <Map className="h-4 w-4 mr-1" />
              Map View
            </Button>
          </Link>
          <Link href="/communities/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-storm-light">Show:</span>
        <div className="flex gap-1 flex-wrap">
          {(
            [
              { value: "all", label: "All Communities" },
              { value: "joined", label: "My Communities", icon: Users },
              { value: "geographic", label: "Geographic" },
              { value: "interest", label: "Interest" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterType(option.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5",
                filterType === option.value
                  ? "bg-ocean text-white"
                  : "bg-gray-100 text-storm hover:bg-gray-200"
              )}
            >
              {"icon" in option && option.icon && <option.icon className="h-3.5 w-3.5" />}
              {option.label}
              {option.value === "joined" && filterType !== "joined" && joinedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-ocean/20 text-ocean rounded-full">
                  {joinedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-storm-light" />
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm placeholder:text-storm-light/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-storm-light">Loading communities...</p>
        </div>
      ) : filterType === "geographic" && groupedByLevel ? (
        /* Geographic view - grouped by level */
        <div className="space-y-6">
          {groupedByLevel.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-storm-light">No geographic communities found.</p>
            </div>
          ) : (
            groupedByLevel.map(([level, levelCommunities]) => {
              const config = LEVEL_CONFIG[level] || { label: level, icon: MapPin, order: 99 };
              const LevelIcon = config.icon;
              const isExpanded = expandedLevels.has(level);
              const displayCommunities = search ? levelCommunities : levelCommunities;

              return (
                <div key={level} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Level header */}
                  <button
                    onClick={() => toggleLevel(level)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LevelIcon className="h-5 w-5 text-ocean" />
                      <span className="font-heading font-semibold text-storm">
                        {config.label}
                      </span>
                      <span className="text-sm text-storm-light">
                        ({levelCommunities.length})
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-storm-light" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-storm-light" />
                    )}
                  </button>

                  {/* Level content */}
                  {isExpanded && (
                    <div className="p-4">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayCommunities.map((community: any) => (
                          <CommunityCard
                            key={community.id}
                            community={community}
                            showParent
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Tip for map view */}
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-storm-light">
            <Map className="h-4 w-4" />
            <span>Tip: Use</span>
            <Link href="/communities/map" className="text-ocean hover:underline font-medium">
              Map View
            </Link>
            <span>to explore communities by location</span>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : filterType === "joined" ? (
        <EmptyState
          icon={Users}
          title="No communities yet."
          message="You haven't joined any communities. Explore communities around your neighborhood or causes you care about."
          action={{ label: "Browse All Communities", href: "#" }}
        />
      ) : search ? (
        <EmptyState
          icon={Search}
          title="No communities found."
          message="Try adjusting your search terms or explore different filters."
        />
      ) : (
        <EmptyState
          icon={Users}
          title="No communities yet."
          message="Be the first to create a community and bring people together around shared interests or locations."
          action={{ label: "Create a Community", href: "/communities/new" }}
        />
      )}
    </div>
  );
}
