"use client";

import { useState, useEffect } from "react";
import { CommunityCard } from "@/components/communities/community-card";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/communities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCommunities(data);
      });
  }, []);

  const filtered = communities.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

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
        <Link href="/communities/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </Link>
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

      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-storm-light">
            {search ? "No communities found." : "No communities yet. Create the first one!"}
          </p>
        </div>
      )}
    </div>
  );
}
