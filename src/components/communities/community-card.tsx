"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, MapPin, Check, ChevronRight, Trophy } from "lucide-react";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    location?: string | null;
    category?: string | null;
    memberCount: number;
    creator: { name: string };
    _count: { projects: number; children?: number; milestones?: number };
    type?: string;
    level?: string | null;
    slug?: string | null;
    isMember?: boolean;
    memberRole?: string | null;
    parent?: { id: string; name: string; slug: string } | null;
    milestones?: Array<{ type: string }>;
  };
  showParent?: boolean;
}

export function CommunityCard({ community, showParent }: CommunityCardProps) {
  return (
    <Link href={`/communities/${community.id}`}>
      <Card hover className={community.isMember ? "ring-2 ring-teal/30" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex flex-wrap gap-1">
              {community.isMember && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Joined
                </Badge>
              )}
              {community.category && (
                <Badge variant="ocean">{community.category}</Badge>
              )}
              {community.level && (
                <Badge variant="default">
                  {community.level.charAt(0).toUpperCase() + community.level.slice(1)}
                </Badge>
              )}
              {community.type === "interest" && !community.level && (
                <Badge variant="default">Interest</Badge>
              )}
            </div>
          </div>
          {/* Parent breadcrumb */}
          {showParent && community.parent && (
            <div className="flex items-center gap-1 text-xs text-storm-light mb-1">
              <span>{community.parent.name}</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
          <h3 className="font-heading font-semibold text-lg text-storm mb-1">
            {community.name}
          </h3>
          <p className="text-sm text-storm-light mb-4 line-clamp-2">
            {community.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-storm-light">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {community.memberCount} member{community.memberCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {community._count.projects} project{community._count.projects !== 1 ? "s" : ""}
            </span>
            {community._count.children && community._count.children > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {community._count.children} sub-region{community._count.children !== 1 ? "s" : ""}
              </span>
            )}
            {!community._count.children && community.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {community.location}
              </span>
            )}
          </div>

          {/* Show "includes X sub-communities" for parent communities */}
          {community._count.children && community._count.children > 0 && (
            <p className="text-xs text-ocean mt-2">
              Stats include {community._count.children} sub-region{community._count.children !== 1 ? "s" : ""}
            </p>
          )}

          {/* Milestone badges */}
          {community.milestones && community.milestones.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Trophy className="h-3 w-3 text-gold" />
              <span className="text-xs text-gold">
                {community.milestones.length} milestone{community.milestones.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
