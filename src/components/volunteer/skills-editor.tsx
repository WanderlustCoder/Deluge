'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Check, AlertCircle } from 'lucide-react';

interface Skill {
  id: string;
  skill: string;
  category: string;
  level: string;
  description: string | null;
  isPublic: boolean;
}

interface SkillsEditorProps {
  skills: Skill[];
  categories: Record<string, { label: string; icon: string }>;
  levels: Record<string, { label: string; description: string }>;
  onAdd: (skill: { skill: string; category: string; level: string; description?: string; isPublic?: boolean }) => Promise<void>;
  onUpdate: (id: string, updates: { level?: string; description?: string; isPublic?: boolean }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function SkillsEditor({ skills, categories, levels, onAdd, onUpdate, onRemove }: SkillsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState({ skill: '', category: '', level: 'intermediate', description: '', isPublic: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newSkill.skill.trim() || !newSkill.category) {
      setError('Skill name and category are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAdd(newSkill);
      setNewSkill({ skill: '', category: '', level: 'intermediate', description: '', isPublic: true });
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this skill?')) return;

    setLoading(true);
    try {
      await onRemove(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = Object.entries(categories);

  return (
    <div className="space-y-4">
      {/* Existing Skills */}
      <div className="space-y-3">
        {skills.map((skill) => (
          <motion.div
            key={skill.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-storm/20 rounded-lg p-4 border border-storm/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{categories[skill.category]?.icon || '📌'}</span>
                  <h4 className="font-medium text-ocean dark:text-sky">
                    {skill.skill}
                  </h4>
                  <span className="text-xs bg-storm/10 dark:bg-foam/10 px-2 py-0.5 rounded">
                    {levels[skill.level]?.label || skill.level}
                  </span>
                  {!skill.isPublic && (
                    <span className="text-xs text-storm/50 dark:text-foam/50">
                      (private)
                    </span>
                  )}
                </div>
                <p className="text-sm text-storm/60 dark:text-foam/60 mt-1">
                  {categories[skill.category]?.label || skill.category}
                </p>
                {skill.description && (
                  <p className="text-sm text-storm/70 dark:text-foam/70 mt-2">
                    {skill.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(editingId === skill.id ? null : skill.id)}
                  className="p-1.5 rounded hover:bg-storm/10 dark:hover:bg-foam/10 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-storm/60 dark:text-foam/60" />
                </button>
                <button
                  onClick={() => handleRemove(skill.id)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Edit Panel */}
            <AnimatePresence>
              {editingId === skill.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-storm/10 dark:border-foam/10 space-y-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-storm/60 dark:text-foam/60 mb-1">
                      Level
                    </label>
                    <select
                      value={skill.level}
                      onChange={(e) => onUpdate(skill.id, { level: e.target.value })}
                      className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 text-sm"
                    >
                      {Object.entries(levels).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={skill.isPublic}
                      onChange={(e) => onUpdate(skill.id, { isPublic: e.target.checked })}
                      className="rounded border-storm/30"
                    />
                    <label className="text-sm text-storm/70 dark:text-foam/70">
                      Show on public profile
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Add New Skill */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-teal/5 rounded-lg p-4 border border-teal/20 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-storm/60 dark:text-foam/60 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                  placeholder="e.g., Carpentry"
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-storm/60 dark:text-foam/60 mb-1">
                  Category *
                </label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 text-sm"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-storm/60 dark:text-foam/60 mb-1">
                Level
              </label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 text-sm"
              >
                {Object.entries(levels).map(([key, val]) => (
                  <option key={key} value={key}>{val.label} - {val.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-storm/60 dark:text-foam/60 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newSkill.description}
                onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                placeholder="Brief description of your experience..."
                rows={2}
                className="w-full px-3 py-2 border border-storm/20 dark:border-foam/20 rounded-lg bg-white dark:bg-storm/20 text-sm resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newSkill.isPublic}
                onChange={(e) => setNewSkill({ ...newSkill, isPublic: e.target.checked })}
                className="rounded border-storm/30"
              />
              <label className="text-sm text-storm/70 dark:text-foam/70">
                Show on public profile
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 border border-storm/20 dark:border-foam/20 rounded-lg text-sm hover:bg-storm/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex-1 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-storm/20 dark:border-foam/20 rounded-lg text-storm/60 dark:text-foam/60 hover:border-teal hover:text-teal transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Skill
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
