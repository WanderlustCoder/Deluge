"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { PROJECT_CATEGORIES } from "@/lib/constants";

interface ProjectFiltersProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
  activeCategory: string | null;
}

export function ProjectFilters({
  onSearchChange,
  onCategoryChange,
  activeCategory,
}: ProjectFiltersProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  return (
    <div className="space-y-4 mb-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-storm-light" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-storm placeholder:text-storm-light/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeCategory === null
              ? "bg-ocean text-white"
              : "bg-gray-100 text-storm hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {PROJECT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              onCategoryChange(activeCategory === cat ? null : cat)
            }
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "bg-ocean text-white"
                : "bg-gray-100 text-storm hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
