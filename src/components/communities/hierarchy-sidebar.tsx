"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, MapPin, Users, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  slug: string | null;
  level: string | null;
  memberCount: number;
  _count?: {
    children: number;
    projects: number;
  };
}

interface HierarchySidebarProps {
  currentSlug?: string;
}

interface TreeNodeProps {
  community: Community;
  currentSlug?: string;
  depth: number;
}

function TreeNode({ community, currentSlug, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const hasChildren = community._count && community._count.children > 0;
  const isActive = community.slug === currentSlug;
  const isAncestor = currentSlug?.startsWith(community.slug + "/");

  // Auto-expand if this is an ancestor of the current node
  useEffect(() => {
    if (isAncestor && !expanded) {
      setExpanded(true);
    }
  }, [isAncestor, expanded]);

  // Load children when expanded
  useEffect(() => {
    if (expanded && hasChildren && children.length === 0) {
      setLoading(true);
      fetch(`/api/communities/hierarchy?parentId=${community.id}&includeStats=true`)
        .then((res) => res.json())
        .then((data) => {
          setChildren(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [expanded, hasChildren, children.length, community.id]);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded-md transition-colors",
          isActive
            ? "bg-ocean/10 text-ocean"
            : "hover:bg-gray-100 text-storm"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Link to community */}
        <Link
          href={`/communities/map/${community.slug}`}
          className="flex-1 flex items-center gap-2 min-w-0"
        >
          <span className={cn("truncate", isActive && "font-medium")}>
            {community.name}
          </span>
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-storm-light">
          {community.memberCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {community.memberCount}
            </span>
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && (
        <div>
          {loading ? (
            <div
              className="py-2 text-xs text-storm-light"
              style={{ paddingLeft: `${(depth + 1) * 12 + 28}px` }}
            >
              Loading...
            </div>
          ) : (
            children.map((child) => (
              <TreeNode
                key={child.id}
                community={child}
                currentSlug={currentSlug}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function HierarchySidebar({ currentSlug }: HierarchySidebarProps) {
  const [roots, setRoots] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/communities/hierarchy?parentId=null&includeStats=true")
      .then((res) => res.json())
      .then((data) => {
        setRoots(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-heading font-semibold text-sm text-storm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-ocean" />
          Browse by Location
        </h3>
      </div>

      <div className="p-2 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="py-4 text-center text-sm text-storm-light">
            Loading...
          </div>
        ) : roots.length === 0 ? (
          <div className="py-4 text-center text-sm text-storm-light">
            No geographic communities yet
          </div>
        ) : (
          roots.map((root) => (
            <TreeNode
              key={root.id}
              community={root}
              currentSlug={currentSlug}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
}
