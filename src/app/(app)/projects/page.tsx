"use client";

import { useState, useEffect, useCallback } from "react";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectFilters } from "@/components/projects/project-filters";
import type { Project } from "@prisma/client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleCategoryChange = useCallback((cat: string | null) => {
    setCategory(cat);
  }, []);

  const filtered = projects.filter((p) => {
    const matchesCategory = !category || p.category === category;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-storm">
          Community Projects
        </h1>
        <p className="text-storm-light mt-1">
          Fund the projects that matter to your community.
        </p>
      </div>

      <ProjectFilters
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        activeCategory={category}
      />

      <ProjectGrid projects={filtered} />
    </div>
  );
}
