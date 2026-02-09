'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  senderId: string;
  isOwn: boolean;
  createdAt: string;
  attachments: string[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  milestones: {
    id: string;
    title: string;
    isCompleted: boolean;
  }[];
}

export default function MentorshipMessagesPage() {
  const params = useParams();
  const mentorshipId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [messagesRes, goalsRes] = await Promise.all([
          fetch(`/api/mentorship/${mentorshipId}/messages`),
          fetch(`/api/mentorship/${mentorshipId}/goals`),
        ]);

        if (messagesRes.ok) {
          const data = await messagesRes.json();
          setMessages(data.messages);
        }
        if (goalsRes.ok) {
          const data = await goalsRes.json();
          setGoals(data.goals);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mentorshipId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/mentorship/${mentorshipId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, { ...message, isOwn: true, attachments: [] }]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/mentorship"
          className="text-storm-light dark:text-dark-text-secondary hover:text-ocean dark:hover:text-sky"
        >
          ← Back to Mentorship
        </Link>
        <button
          onClick={() => setShowGoals(!showGoals)}
          className="px-4 py-2 text-sm bg-teal/10 text-teal rounded-lg hover:bg-teal/20"
        >
          {showGoals ? 'Hide Goals' : 'View Goals'}
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col bg-white dark:bg-dark-elevated rounded-xl border border-gray-200">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-storm-light dark:text-dark-text-secondary">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-xl ${
                      msg.isOwn
                        ? 'bg-ocean text-white'
                        : 'bg-gray-100 dark:bg-dark-border text-storm dark:text-dark-text'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.isOwn ? 'text-white/70' : 'text-storm-light dark:text-dark-text-secondary'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white dark:bg-dark-elevated text-storm dark:text-dark-text"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {/* Goals Sidebar */}
        {showGoals && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 p-4 overflow-y-auto"
          >
            <h3 className="font-semibold text-ocean dark:text-sky mb-4">Learning Goals</h3>

            {goals.length === 0 ? (
              <p className="text-sm text-storm-light dark:text-dark-text-secondary">
                No goals set yet. Add goals to track progress.
              </p>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => (
                  <div
                    key={goal.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-dark-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-storm dark:text-dark-text text-sm">
                        {goal.title}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          goal.status === 'completed'
                            ? 'bg-teal/20 text-teal'
                            : 'bg-gold/20 text-gold'
                        }`}
                      >
                        {goal.progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 dark:bg-dark-border/50 rounded-full mb-2">
                      <div
                        className="h-full bg-teal rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div className="space-y-1">
                        {goal.milestones.map(m => (
                          <label
                            key={m.id}
                            className="flex items-center gap-2 text-sm text-storm-light dark:text-dark-text-secondary"
                          >
                            <input
                              type="checkbox"
                              checked={m.isCompleted}
                              readOnly
                              className="rounded border-storm/30"
                            />
                            <span className={m.isCompleted ? 'line-through' : ''}>
                              {m.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
