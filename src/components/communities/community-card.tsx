"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, MapPin } from "lucide-react";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    location?: string | null;
    category?: string | null;
    memberCount: number;
    creator: { name: string };
    _count: { projects: number };
  };
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link href={`/communities/${community.id}`}>
      <Card hover>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            {community.category && (
              <Badge variant="ocean">{community.category}</Badge>
            )}
          </div>
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
            {community.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {community.location}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
