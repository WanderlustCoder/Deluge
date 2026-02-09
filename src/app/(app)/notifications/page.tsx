'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatDate } from '@/lib/i18n/formatting';

interface NotificationData {
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
  priority?: string;
  entityType?: string;
  entityId?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData | null;
  read: boolean;
  createdAt: string;
}

type FilterStatus = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  async function fetchNotifications() {
    try {
      const res = await fetch(
        `/api/notifications?page=${page}&status=${filter}&limit=20`
      );
      if (res.ok) {
        const data = await res.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.unreadCount);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async function bulkAction(action: string) {
    if (selectedIds.size === 0) return;

    try {
      await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
      });

      if (action === 'markSelectedRead') {
        setNotifications((prev) =>
          prev.map((n) =>
            selectedIds.has(n.id) ? { ...n, read: true } : n
          )
        );
      } else if (action === 'deleteSelected') {
        setNotifications((prev) =>
          prev.filter((n) => !selectedIds.has(n.id))
        );
      }
      setSelectedIds(new Set());
      fetchNotifications();
    } catch (error) {
      console.error('Error with bulk action:', error);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function getTypeIcon(type: string) {
    const icons: Record<string, string> = {
      funding: '\ud83d\udcb0',
      milestone: '\ud83c\udfc6',
      loan: '\ud83c\udfe6',
      community: '\ud83d\udc65',
      social: '\ud83d\udc4b',
      celebration: '\ud83c\udf89',
      system: '\u2699\ufe0f',
      badge_earned: '\ud83c\udfc5',
      referral_signup: '\ud83d\udc65',
      loan_funded: '\u2705',
    };
    return icons[type] || '\ud83d\udd14';
  }

  function formatTime(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 text-sm text-ocean hover:text-ocean/80 disabled:opacity-50"
          >
            Mark all read
          </button>
          <Link
            href="/account/notifications"
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'unread', 'read'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm rounded-lg capitalize ${
              filter === status
                ? 'bg-ocean text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4 p-3 bg-ocean/10 rounded-lg"
        >
          <span className="text-sm text-ocean">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => bulkAction('markSelectedRead')}
            className="text-sm text-ocean hover:underline"
          >
            Mark as read
          </button>
          <button
            onClick={() => bulkAction('deleteSelected')}
            className="text-sm text-red-500 hover:underline"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-gray-500 hover:underline ml-auto"
          >
            Clear selection
          </button>
        </motion.div>
      )}

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                notification.read
                  ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                  : 'bg-ocean/5 border-ocean/20'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(notification.id)}
                onChange={() => toggleSelect(notification.id)}
                className="mt-1"
              />
              <span className="text-2xl">{getTypeIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-medium ${
                      notification.read
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-ocean rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-400">
                    {formatTime(notification.createdAt)}
                  </span>
                  {notification.data?.actionUrl && (
                    <Link
                      href={notification.data.actionUrl}
                      className="text-xs text-ocean hover:underline"
                      onClick={() => markAsRead(notification.id)}
                    >
                      {notification.data.actionLabel || 'View'}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-gray-400 hover:text-ocean"
                    title="Mark as read"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">\ud83d\udd14</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No notifications
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unread'
              ? "You've read all your notifications"
              : "You don't have any notifications yet"}
          </p>
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
