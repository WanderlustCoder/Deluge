'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, Search, Lock, Globe } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";

interface Circle {
  id: string;
  name: string;
  description: string | null;
  topic: string | null;
  facilitatorName: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isMember: boolean;
  isFacilitator: boolean;
  createdAt: string;
}

export default function StudyCirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const [publicRes, myRes] = await Promise.all([
        fetch('/api/learn/circles'),
        fetch('/api/learn/circles?my=true'),
      ]);
      const publicData = await publicRes.json();
      const myData = await myRes.json();
      setCircles(publicData.circles || []);
      setMyCircles(myData.circles || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCircle = async (circleId: string) => {
    try {
      const res = await fetch(`/api/learn/circles/${circleId}/join`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchCircles();
      }
    } catch (error) {
      console.error('Error joining circle:', error);
    }
  };

  const filteredCircles = circles.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Study Circles</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Learn together in small groups. Study circles are spaces for collaborative
            exploration - no leaders, no grades, just peers learning from each other.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* My Circles */}
        {myCircles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Your Circles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCircles.map((circle) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  onJoin={() => {}}
                  showJoin={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-storm/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90"
          >
            <Plus className="w-4 h-4" />
            Start a Circle
          </button>
        </div>

        {/* Public Circles */}
        <h2 className="text-lg font-semibold mb-4">Public Circles</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredCircles.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-storm/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No circles found.</h3>
            <p className="text-storm/60 mb-4">
              Be the first to start a study circle!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCircles.map((circle) => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onJoin={() => joinCircle(circle.id)}
                showJoin={!circle.isMember}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCircleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={() => {
            setShowCreateModal(false);
            fetchCircles();
          }}
        />
      )}
    </div>
  );
}

function CircleCard({
  circle,
  onJoin,
  showJoin,
}: {
  circle: Circle;
  onJoin: () => void;
  showJoin: boolean;
}) {
  const isFull = circle.memberCount >= circle.maxMembers;

  return (
    <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{circle.name}</h3>
          {circle.topic && (
            <span className="text-xs text-ocean">{circle.topic}</span>
          )}
        </div>
        {circle.isPrivate ? (
          <Lock className="w-4 h-4 text-storm/40" />
        ) : (
          <Globe className="w-4 h-4 text-storm/40" />
        )}
      </div>

      {circle.description && (
        <p className="text-sm text-storm/60 mb-3 line-clamp-2">
          {circle.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-storm/50">
        <span>Facilitated by {circle.facilitatorName}</span>
        <span>{circle.memberCount}/{circle.maxMembers} members</span>
      </div>

      {showJoin && (
        <button
          onClick={onJoin}
          disabled={isFull}
          className="w-full mt-3 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isFull ? 'Circle Full' : 'Join Circle'}
        </button>
      )}

      {circle.isMember && (
        <Link
          href={`/learn/circles/${circle.id}`}
          className="block w-full mt-3 px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 text-sm text-center"
        >
          View Circle
        </Link>
      )}
    </div>
  );
}

function CreateCircleModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/learn/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          topic: topic.trim() || null,
          isPrivate,
        }),
      });

      if (res.ok) {
        onCreate();
      }
    } catch (error) {
      console.error('Error creating circle:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-elevated rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Start a Study Circle</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Circle Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Effective Giving Explorers"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Topic (optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Understanding Impact"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this circle explore together?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent resize-none dark:bg-gray-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded text-ocean focus:ring-ocean"
            />
            <label htmlFor="isPrivate" className="text-sm">
              Make this circle private (invite only)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="flex-1 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Circle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
