"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapBreadcrumbs } from "@/components/communities/map-breadcrumbs";
import { HierarchySidebar } from "@/components/communities/hierarchy-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  List,
  MapPin,
  Users,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  Building2,
  Home,
} from "lucide-react";

interface Breadcrumb {
  id: string;
  name: string;
  slug: string;
  level: string | null;
}

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string | null;
  level: string | null;
  latitude: number | null;
  longitude: number | null;
  memberCount: number;
  type: string;
  isMember?: boolean;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children?: Community[];
  _count?: {
    members: number;
    projects: number;
    children: number;
  };
  breadcrumbs?: Breadcrumb[];
}

// Get icon for community level
function getLevelIcon(level: string | null) {
  switch (level) {
    case "city":
      return Building2;
    case "neighborhood":
    case "district":
      return Home;
    default:
      return MapPin;
  }
}

// Get child level label
function getChildLabel(level: string | null): string {
  switch (level) {
    case "country":
      return "States";
    case "state":
      return "Counties";
    case "county":
      return "Cities";
    case "city":
      return "Neighborhoods";
    default:
      return "Sub-regions";
  }
}

export default function CommunityMapDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const slugPath = slug.join("/");
  const router = useRouter();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/communities/by-slug/${slugPath}`)
      .then((res) => {
        if (!res.ok) throw new Error("Community not found");
        return res.json();
      })
      .then((data) => {
        setCommunity(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slugPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-storm-light">Loading...</p>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center py-12">
        <p className="text-storm-light mb-4">{error || "Community not found"}</p>
        <Link href="/communities/map">
          <Button variant="outline">Back to Map</Button>
        </Link>
      </div>
    );
  }

  const LevelIcon = getLevelIcon(community.level);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-3xl text-storm flex items-center gap-2">
            <LevelIcon className="h-7 w-7 text-ocean" />
            {community.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {community.level && (
              <Badge variant="ocean">
                {community.level.charAt(0).toUpperCase() + community.level.slice(1)}
              </Badge>
            )}
            {community.isMember && (
              <Badge variant="success">Joined</Badge>
            )}
            <span className="text-storm-light">{community.description}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/communities/${community.id}`}>
            <Button size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Community
            </Button>
          </Link>
          <Link href="/communities/map">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-1" />
              Back to Map
            </Button>
          </Link>
          <Link href="/communities">
            <Button variant="outline" size="sm">
              <List className="h-4 w-4 mr-1" />
              List View
            </Button>
          </Link>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4">
        <MapBreadcrumbs
          breadcrumbs={community.breadcrumbs || []}
          current={{ name: community.name, level: community.level }}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-3">
          {/* Children list */}
          {community.children && community.children.length > 0 ? (
            <div>
              <h2 className="font-heading font-semibold text-lg text-storm mb-4">
                {getChildLabel(community.level)}{" "}
                <span className="text-storm-light font-normal">
                  ({community.children.length})
                </span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {community.children.map((child) => {
                  const ChildIcon = getLevelIcon(child.level);
                  return (
                    <Link
                      key={child.id}
                      href={`/communities/map/${child.slug}`}
                      className="block"
                    >
                      <Card hover className={child.isMember ? "ring-2 ring-teal/30" : ""}>
                        <CardContent className="pt-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <ChildIcon className="h-4 w-4 text-ocean" />
                                <h3 className="font-heading font-semibold text-storm">
                                  {child.name}
                                </h3>
                                {child.isMember && (
                                  <Badge variant="success" className="text-xs px-1.5 py-0">
                                    Joined
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-storm-light mt-1">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {child.memberCount} members
                                </span>
                                {child._count && child._count.children > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {child._count.children} sub-regions
                                  </span>
                                )}
                                {child._count && child._count.projects > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FolderOpen className="h-3 w-3" />
                                    {child._count.projects} projects
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-storm-light">
                  No sub-regions in this community
                </p>
                <Link href={`/communities/${community.id}`}>
                  <Button variant="outline" size="sm" className="mt-3">
                    View Community Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Community info card */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="font-heading font-semibold text-sm text-storm mb-3">
                About {community.name}
              </h3>
              <p className="text-sm text-storm-light mb-4">
                {community.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-storm-light">
                    <Users className="h-4 w-4" />
                    Members
                  </span>
                  <span className="font-medium text-storm">
                    {community._count?.members || community.memberCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-storm-light">
                    <FolderOpen className="h-4 w-4" />
                    Projects
                  </span>
                  <span className="font-medium text-storm">
                    {community._count?.projects || 0}
                  </span>
                </div>
                {community._count && community._count.children > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-storm-light">
                      <MapPin className="h-4 w-4" />
                      Sub-regions
                    </span>
                    <span className="font-medium text-storm">
                      {community._count.children}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href={`/communities/${community.id}`}>
                  <Button className="w-full" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Full Community
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy tree */}
          <HierarchySidebar currentSlug={slugPath} />
        </div>
      </div>
    </div>
  );
}
