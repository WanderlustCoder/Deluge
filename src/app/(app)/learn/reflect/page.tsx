'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Lock, RefreshCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/i18n/formatting';
import { Spinner } from "@/components/ui/spinner";

interface Reflection {
  id: string;
  prompt: string;
  response: string;
  isPrivate: boolean;
  createdAt: string;
}

interface Prompt {
  id: string;
  prompt: string;
  category: string;
}

export default function ReflectPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/learn/reflections?includePrompt=true');
      const data = await res.json();
      setReflections(data.reflections || []);
      setPrompts(data.prompts || []);
      setCurrentPrompt(data.prompt);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNewPrompt = () => {
    const usedPrompts = new Set(reflections.slice(0, 5).map((r) => r.prompt));
    const available = prompts.filter((p) => !usedPrompts.has(p.prompt));
    if (available.length > 0) {
      setCurrentPrompt(available[Math.floor(Math.random() * available.length)]);
    } else {
      setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt || !response.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/learn/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt.prompt,
          response: response.trim(),
          isPrivate: true,
        }),
      });

      if (res.ok) {
        const newReflection = await res.json();
        setReflections([newReflection, ...reflections]);
        setResponse('');
        getNewPrompt();
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/20 flex items-center justify-center dark:bg-dark-bg">
        <Spinner size="lg" />
      </div>
    );
  }

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
            <MessageCircle className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Reflection Journal</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            A private space to reflect on your giving journey. No pressure, no tracking -
            just thoughtful exploration when you&apos;re ready.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Current Prompt */}
          {currentPrompt && (
            <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold">Today&apos;s Prompt</h2>
                <button
                  onClick={getNewPrompt}
                  className="text-storm/50 hover:text-ocean transition-colors"
                  title="Get a different prompt"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <p className="text-lg mb-4">{currentPrompt.prompt}</p>

              <form onSubmit={handleSubmit}>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent resize-none dark:bg-gray-100"
                />

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-storm/50">
                    <Lock className="w-4 h-4" />
                    Your reflections are private by default
                  </div>
                  <button
                    type="submit"
                    disabled={!response.trim() || saving}
                    className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Reflection'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Past Reflections */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Reflections</h2>

            {reflections.length === 0 ? (
              <div className="text-center py-8 text-storm/50">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No reflections yet. Start with the prompt above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {reflections.map((reflection) => (
                    <motion.div
                      key={reflection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-4"
                    >
                      <p className="text-sm text-storm/50 mb-2">{reflection.prompt}</p>
                      <p className="whitespace-pre-wrap">{reflection.response}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-storm/40">
                          {formatDate(reflection.createdAt)}
                        </span>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this reflection?')) {
                              await fetch(`/api/learn/reflections/${reflection.id}`, {
                                method: 'DELETE',
                              });
                              setReflections(reflections.filter((r) => r.id !== reflection.id));
                            }
                          }}
                          className="text-storm/30 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Other Prompts */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-storm/50 mb-3">Or explore other prompts:</h3>
            <div className="flex flex-wrap gap-2">
              {prompts.slice(0, 6).map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setCurrentPrompt(prompt)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    currentPrompt?.id === prompt.id
                      ? 'bg-ocean text-white'
                      : 'bg-gray-100 text-storm/70 hover:bg-gray-200'
                  }`}
                >
                  {prompt.prompt.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
