'use client';

import { useState, useEffect } from 'react';
import { Code, Search } from 'lucide-react';
import { EmbedGenerator } from '@/components/developer/embed-generator';

interface Project {
  id: string;
  title: string;
  category: string;
}

export default function EmbedsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?status=active&limit=50');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6" />
            Embed Widgets
          </h1>
          <p className="text-storm/60 mt-1">
            Add donate buttons and project cards to your website
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <h2 className="font-semibold mb-3">Select a Project</h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-storm/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-4 py-2 border border-storm/20 rounded-lg focus:ring-2 focus:ring-ocean focus:border-ocean"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ocean" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProject?.id === project.id
                          ? 'border-ocean bg-ocean/5'
                          : 'border-storm/10 hover:bg-storm/5'
                      }`}
                    >
                      <p className="font-medium truncate">{project.title}</p>
                      <p className="text-xs text-storm/60">{project.category}</p>
                    </button>
                  ))}
                  {filteredProjects.length === 0 && (
                    <p className="text-center text-storm/50 py-4">
                      No projects found
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Embed Generator */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-storm/20 border border-storm/10 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Configure Widget</h2>
              <EmbedGenerator
                projectId={selectedProject?.id}
                projectTitle={selectedProject?.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
