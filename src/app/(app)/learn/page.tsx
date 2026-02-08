'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calculator,
  MessageCircle,
  Users,
  Award,
  Search,
  Lightbulb,
  Heart,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { ResourceCard } from '@/components/learn/resource-card';

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  format: string;
  estimatedMinutes: number | null;
  imageUrl: string | null;
}

interface Category {
  id: string;
  label: string;
  description: string;
  count: number;
}

const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  giving: Heart,
  financial: TrendingUp,
  impact: Lightbulb,
  community: Building2,
};

const QUICK_LINKS = [
  { href: '/learn/budget', label: 'Budget Planner', icon: Calculator, description: 'Plan your giving' },
  { href: '/learn/taxes', label: 'Tax Information', icon: BookOpen, description: 'Understand tax benefits' },
  { href: '/learn/reflect', label: 'Reflection Journal', icon: MessageCircle, description: 'Private reflections' },
  { href: '/learn/scenarios', label: 'Decision Scenarios', icon: Lightbulb, description: 'Explore giving decisions' },
  { href: '/learn/circles', label: 'Study Circles', icon: Users, description: 'Learn together' },
  { href: '/learn/certificates', label: 'Certificates', icon: Award, description: 'Optional recognition' },
];

export default function LearnPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/learn/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="min-h-screen bg-foam dark:bg-storm/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean to-teal text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Learn</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Explore resources about effective giving, financial wellness, and community impact.
            No progress tracking, no quizzes - just helpful information when you need it.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white dark:bg-storm/20 border border-storm/10 rounded-xl p-4 hover:shadow-lg transition-shadow text-center group"
            >
              <link.icon className="w-8 h-8 mx-auto mb-2 text-ocean group-hover:text-teal transition-colors" />
              <h3 className="font-medium text-sm">{link.label}</h3>
              <p className="text-xs text-storm/60 mt-1">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border border-storm/20 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-storm/10"
            />
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-ocean text-white'
                : 'bg-storm/10 text-storm/70 hover:bg-storm/20'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || BookOpen;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-ocean text-white'
                    : 'bg-storm/10 text-storm/70 hover:bg-storm/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                <span className="text-xs opacity-70">({cat.count})</span>
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-storm/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No resources found</h2>
            <p className="text-storm/60">
              {searchQuery
                ? 'Try a different search term'
                : 'Check back soon for new content'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}

        {/* Philosophy Note */}
        <div className="mt-12 p-6 bg-sky/10 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-sky" />
            Our Approach to Learning
          </h3>
          <p className="text-storm/70 text-sm">
            We believe learning happens best when it&apos;s self-directed and pressure-free.
            There are no quizzes to pass, no progress to track, and no certificates required.
            Explore what interests you, when it interests you.
          </p>
        </div>
      </div>
    </div>
  );
}
