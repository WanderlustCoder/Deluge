'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, DollarSign } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleSlug: string;
  poolBalance: number;
  onSuccess: () => void;
}

interface Project {
  id: string;
  title: string;
  fundingGoal: number;
  fundingRaised: number;
}

export function CreateProposalModal({
  isOpen,
  onClose,
  circleSlug,
  poolBalance,
  onSuccess,
}: CreateProposalModalProps) {
  const [type, setType] = useState<'project' | 'loan' | 'custom'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loanId, setLoanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [searching, setSearching] = useState(false);

  // Search for projects
  useEffect(() => {
    if (type !== 'project' || projectSearch.length < 2) {
      setProjects([]);
      return;
    }

    const search = async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/projects?search=${encodeURIComponent(projectSearch)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error('Failed to search projects:', err);
      } finally {
        setSearching(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [projectSearch, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > poolBalance) {
      setError('Amount exceeds pool balance');
      return;
    }

    if (type === 'project' && !projectId) {
      setError('Please select a project');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/circles/${circleSlug}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description: description || undefined,
          amount: numAmount,
          projectId: type === 'project' ? projectId : undefined,
          loanId: type === 'loan' ? loanId : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create proposal');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType('project');
    setTitle('');
    setDescription('');
    setAmount('');
    setProjectId('');
    setLoanId('');
    setProjectSearch('');
    setProjects([]);
  };

  const selectProject = (project: Project) => {
    setProjectId(project.id);
    setTitle(`Fund: ${project.title}`);
    setProjectSearch(project.title);
    setProjects([]);
    // Suggest remaining amount
    const remaining = project.fundingGoal - project.fundingRaised;
    const suggestedAmount = Math.min(remaining, poolBalance);
    setAmount(suggestedAmount.toFixed(2));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-storm rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-storm/10 dark:hover:bg-foam/10"
            >
              <X className="w-5 h-5 text-storm/50 dark:text-foam/50" />
            </button>

            <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-2">
              Create Proposal
            </h2>
            <p className="text-sm text-storm/60 dark:text-foam/60 mb-6">
              Propose how to deploy circle funds. Members will vote.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Proposal Type
                </label>
                <div className="flex gap-2">
                  {(['project', 'loan', 'custom'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        setProjectId('');
                        setLoanId('');
                        setProjectSearch('');
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        type === t
                          ? 'bg-ocean dark:bg-sky text-white'
                          : 'bg-storm/10 dark:bg-foam/10 text-storm/70 dark:text-foam/70 hover:bg-storm/20'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Search */}
              {type === 'project' && (
                <div>
                  <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                    Select Project
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-storm/40" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search for a project..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30"
                    />
                  </div>
                  {projects.length > 0 && (
                    <div className="mt-2 border border-storm/10 rounded-lg overflow-hidden">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => selectProject(project)}
                          className="w-full px-4 py-3 text-left hover:bg-storm/5 dark:hover:bg-foam/5 border-b border-storm/10 last:border-0"
                        >
                          <p className="font-medium text-storm dark:text-foam">
                            {project.title}
                          </p>
                          <p className="text-sm text-storm/50 dark:text-foam/50">
                            ${(project.fundingGoal - project.fundingRaised).toFixed(0)} remaining
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you proposing?"
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why should the circle fund this?"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 resize-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Amount (Pool balance: ${poolBalance.toFixed(2)})
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={poolBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-storm/20 dark:border-foam/20 rounded-lg text-storm/70 dark:text-foam/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Proposal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
