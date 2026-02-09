'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  maxMembers: number;
  meetingSchedule?: string;
  _count: {
    members: number;
  };
}

const GROUP_TYPES = [
  { value: '', label: 'All Groups' },
  { value: 'new_givers', label: 'New Givers' },
  { value: 'loan_funders', label: 'Loan Funders' },
  { value: 'community_leaders', label: 'Community Leaders' },
  { value: 'budgeting', label: 'Budgeting' },
  { value: 'general', label: 'General' },
];

export default function SupportGroupsPage() {
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [myGroups, setMyGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'general',
    maxMembers: 12,
    isPrivate: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const [groupsRes, myRes] = await Promise.all([
          fetch('/api/support-groups'),
          fetch('/api/support-groups?mine=true'),
        ]);

        if (groupsRes.ok) {
          const data = await groupsRes.json();
          setGroups(data.groups);
        }
        if (myRes.ok) {
          const data = await myRes.json();
          setMyGroups(data.groups);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredGroups = groups.filter(group => {
    if (filter.type && group.type !== filter.type) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      if (
        !group.name.toLowerCase().includes(search) &&
        !group.description.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    return true;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/support-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });

      if (res.ok) {
        const group = await res.json();
        setGroups([group, ...groups]);
        setMyGroups([{ ...group, _count: { members: 1 } }, ...myGroups]);
        setShowCreate(false);
        setNewGroup({
          name: '',
          description: '',
          type: 'general',
          maxMembers: 12,
          isPrivate: false,
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ocean dark:text-sky">Support Groups</h1>
          <p className="text-storm-light dark:text-dark-text-secondary mt-1">
            Join peer groups for mutual support and shared learning
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
        >
          Create Group
        </button>
      </div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">My Groups</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {myGroups.map(group => (
              <Link key={group.id} href={`/support-groups/${group.id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-56 p-4 rounded-xl bg-gradient-to-br from-teal/10 to-ocean/10 dark:from-teal/20 dark:to-ocean/20 border border-teal/20 cursor-pointer"
                >
                  <p className="font-medium text-storm dark:text-dark-text">{group.name}</p>
                  <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1">
                    {group._count?.members || 0} members
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search groups..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
        />
        <select
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
        >
          {GROUP_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Groups Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map(group => {
          const isMember = myGroups.some(g => g.id === group.id);
          const isFull = group._count.members >= group.maxMembers;

          return (
            <Link key={group.id} href={`/support-groups/${group.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-xl bg-white dark:bg-dark-elevated border border-gray-200 cursor-pointer h-full"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-storm dark:text-dark-text">{group.name}</h3>
                  {isMember && (
                    <span className="text-xs px-2 py-0.5 bg-teal/20 text-teal rounded">
                      Member
                    </span>
                  )}
                  {!isMember && isFull && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-storm-light dark:text-dark-text-secondary rounded">
                      Full
                    </span>
                  )}
                </div>

                <p className="text-sm text-storm-light dark:text-dark-text-secondary line-clamp-2 mb-3">
                  {group.description}
                </p>

                <div className="flex items-center justify-between text-xs text-storm-light dark:text-dark-text-secondary">
                  <span className="capitalize">{group.type.replace('_', ' ')}</span>
                  <span>
                    {group._count.members}/{group.maxMembers} members
                  </span>
                </div>

                {group.meetingSchedule && (
                  <p className="text-xs text-teal mt-2">{group.meetingSchedule}</p>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 text-storm-light dark:text-dark-text-secondary">
          No groups found. Be the first to create one!
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-elevated rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-4">
              Create Support Group
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-storm dark:text-dark-text mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-storm dark:text-dark-text mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={newGroup.description}
                  onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-storm dark:text-dark-text mb-1">
                    Type
                  </label>
                  <select
                    value={newGroup.type}
                    onChange={e => setNewGroup(g => ({ ...g, type: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
                  >
                    {GROUP_TYPES.filter(t => t.value).map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-storm dark:text-dark-text mb-1">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={50}
                    value={newGroup.maxMembers}
                    onChange={e => setNewGroup(g => ({ ...g, maxMembers: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGroup.isPrivate}
                  onChange={e => setNewGroup(g => ({ ...g, isPrivate: e.target.checked }))}
                  className="rounded border-storm/30"
                />
                <span className="text-storm dark:text-dark-text">Private group (invite only)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-storm dark:text-dark-text hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newGroup.name || !newGroup.description}
                  className="flex-1 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
