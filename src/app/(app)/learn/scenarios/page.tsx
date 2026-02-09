'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScenarioOption {
  id: string;
  title: string;
  description: string;
}

interface ScenarioConsideration {
  id: string;
  point: string;
}

interface Scenario {
  id: string;
  title: string;
  scenario: string;
  options: ScenarioOption[];
  considerations: ScenarioConsideration[];
  category: string;
}

interface Category {
  id: string;
  label: string;
  count: number;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScenarios();
  }, [selectedCategory]);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);

      const res = await fetch(`/api/learn/scenarios?${params}`);
      const data = await res.json();
      setScenarios(data.scenarios || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickRandom = () => {
    if (scenarios.length === 0) return;
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setExpandedId(scenarios[randomIndex].id);
  };

  return (
    <div className="min-h-screen bg-gray-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean to-teal text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Decision Scenarios</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Explore giving decisions through real-world scenarios.
            No right or wrong answers - just considerations to think about.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-ocean text-white'
                  : 'bg-gray-100 text-storm/70 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-ocean text-white'
                    : 'bg-gray-100 text-storm/70 hover:bg-gray-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <button
            onClick={pickRandom}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Random Scenario
          </button>
        </div>

        {/* Scenarios */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-storm/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No scenarios found</h2>
            <p className="text-storm/60">Check back soon for more content</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Scenario Header */}
                <button
                  onClick={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{scenario.title}</h3>
                    <p className="text-storm/60 mt-1 line-clamp-2">
                      {scenario.scenario}
                    </p>
                  </div>
                  {expandedId === scenario.id ? (
                    <ChevronUp className="w-5 h-5 text-storm/40 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-storm/40 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === scenario.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-6 space-y-6">
                        {/* Full Scenario */}
                        <div>
                          <p className="text-lg">{scenario.scenario}</p>
                        </div>

                        {/* Options */}
                        <div>
                          <h4 className="font-medium mb-3">Possible Approaches</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {scenario.options.map((option) => (
                              <div
                                key={option.id}
                                className="p-4 bg-gray-50 rounded-lg"
                              >
                                <h5 className="font-medium mb-1">{option.title}</h5>
                                <p className="text-sm text-storm/60">{option.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Considerations */}
                        <div>
                          <h4 className="font-medium mb-3">Things to Consider</h4>
                          <ul className="space-y-2">
                            {scenario.considerations.map((consideration) => (
                              <li
                                key={consideration.id}
                                className="flex items-start gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-teal rounded-full mt-2 flex-shrink-0" />
                                <span className="text-storm/70">{consideration.point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Note */}
                        <div className="p-4 bg-sky/10 rounded-lg">
                          <p className="text-sm text-storm/70">
                            <strong>Note:</strong> There&apos;s no single &quot;right&quot; answer.
                            These scenarios are meant for exploration and reflection,
                            not to test your knowledge.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
