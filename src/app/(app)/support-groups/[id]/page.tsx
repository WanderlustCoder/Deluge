'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  facilitatorId: string;
  maxMembers: number;
  status: string;
  meetingSchedule?: string;
  members: { userId: string; role: string }[];
  meetings: {
    id: string;
    title?: string;
    scheduledAt: string;
    topic?: string;
  }[];
  posts: {
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
  }[];
  _count: { members: number; posts: number };
}

interface Post {
  id: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  replies: {
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
  }[];
  _count: { replies: number };
}

export default function SupportGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [groupRes, postsRes, myGroupsRes] = await Promise.all([
          fetch(`/api/support-groups/${groupId}`),
          fetch(`/api/support-groups/${groupId}/posts`),
          fetch('/api/support-groups?mine=true'),
        ]);

        if (groupRes.ok) {
          const data = await groupRes.json();
          setGroup(data.group);
        }
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.posts);
        }
        if (myGroupsRes.ok) {
          const data = await myGroupsRes.json();
          setIsMember(data.groups.some((g: SupportGroup) => g.id === groupId));
        }
      } catch (error) {
        console.error('Error loading group:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [groupId]);

  async function handleJoin() {
    setJoining(true);
    try {
      const res = await fetch(`/api/support-groups/${groupId}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        setIsMember(true);
        if (group) {
          setGroup({
            ...group,
            _count: { ...group._count, members: group._count.members + 1 },
          });
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      const res = await fetch(`/api/support-groups/${groupId}/join`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/support-groups');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/support-groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost.trim() }),
      });

      if (res.ok) {
        const post = await res.json();
        setPosts([{ ...post, replies: [], _count: { replies: 0 } }, ...posts]);
        setNewPost('');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-storm-light dark:text-dark-text-secondary">Group not found</p>
        <Link href="/support-groups" className="text-ocean hover:underline mt-2 inline-block">
          Back to groups
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <Link
        href="/support-groups"
        className="text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky inline-block mb-4"
      >
        ← Back to Groups
      </Link>

      <div className="bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-ocean dark:text-sky">{group.name}</h1>
            <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-1 capitalize">
              {group.type.replace('_', ' ')} • {group._count.members}/{group.maxMembers} members
            </p>
          </div>
          {!isMember ? (
            <button
              onClick={handleJoin}
              disabled={joining || group._count.members >= group.maxMembers}
              className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
            >
              {joining ? 'Joining...' : 'Join Group'}
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="px-4 py-2 border border-gray-200 text-storm dark:text-dark-text rounded-lg hover:bg-gray-50"
            >
              Leave Group
            </button>
          )}
        </div>

        <p className="text-storm-light dark:text-dark-text-secondary">{group.description}</p>

        {group.meetingSchedule && (
          <p className="text-sm text-teal mt-3">Schedule: {group.meetingSchedule}</p>
        )}
      </div>

      {/* Upcoming Meetings */}
      {group.meetings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">
            Upcoming Meetings
          </h2>
          <div className="space-y-2">
            {group.meetings.map(meeting => (
              <div
                key={meeting.id}
                className="p-4 rounded-lg bg-teal/10 dark:bg-teal/20 border border-teal/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-storm dark:text-dark-text">
                      {meeting.title || 'Group Meeting'}
                    </p>
                    {meeting.topic && (
                      <p className="text-sm text-storm-light dark:text-dark-text-secondary">{meeting.topic}</p>
                    )}
                  </div>
                  <p className="text-sm text-teal">
                    {new Date(meeting.scheduledAt).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussion Feed */}
      <div>
        <h2 className="text-lg font-semibold text-ocean dark:text-sky mb-3">Discussion</h2>

        {/* New Post Form */}
        {isMember && (
          <form onSubmit={handlePost} className="mb-4">
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share something with the group..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newPost.trim() || posting}
                className="px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-8 text-storm-light dark:text-dark-text-secondary">
            No posts yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg bg-white dark:bg-dark-elevated border border-gray-200 ${
                  post.isPinned ? 'ring-2 ring-gold' : ''
                }`}
              >
                {post.isPinned && (
                  <span className="text-xs text-gold mb-2 block">Pinned</span>
                )}
                <p className="text-storm dark:text-dark-text whitespace-pre-wrap">{post.content}</p>
                <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                  {post._count.replies > 0 && ` • ${post._count.replies} replies`}
                </p>

                {/* Preview replies */}
                {post.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="text-sm">
                        <p className="text-storm-light dark:text-dark-text-secondary">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
