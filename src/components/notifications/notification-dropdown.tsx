"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Award,
  Banknote,
  TrendingUp,
  UserPlus,
  Zap,
  Check,
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  data: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  totalCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "loan_funded":
      return <Banknote className="h-4 w-4 text-teal" />;
    case "loan_payment_received":
      return <Banknote className="h-4 w-4 text-green-500" />;
    case "badge_earned":
      return <Award className="h-4 w-4 text-gold" />;
    case "project_milestone":
      return <TrendingUp className="h-4 w-4 text-ocean" />;
    case "referral_signup":
      return <UserPlus className="h-4 w-4 text-sky" />;
    case "referral_activated":
      return <Zap className="h-4 w-4 text-gold" />;
    default:
      return <Bell className="h-4 w-4 text-storm" />;
  }
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationDropdown({
  notifications,
  totalCount,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }

    if (notification.data) {
      try {
        const parsed = JSON.parse(notification.data);
        if (parsed.link) {
          router.push(parsed.link);
          onClose();
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden dark:bg-dark-elevated dark:border-dark-border"
      role="menu"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
        <h3 className="font-semibold text-storm text-sm dark:text-dark-text" id="notification-dropdown-title">
          Notifications
        </h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-ocean hover:text-ocean/80 font-medium dark:text-ocean-light dark:hover:text-ocean-light/80"
            aria-label="Mark all notifications as read"
          >
            <Check className="h-3 w-3" aria-hidden="true" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto" role="list" aria-label="Notification list">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-storm-light dark:text-dark-text-secondary">
            No notifications yet.
          </div>
        ) : (
          <>
            {notifications.slice(0, 10).map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                role="listitem"
                aria-label={`${notification.title}: ${notification.message}${!notification.read ? " (unread)" : ""}`}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 dark:hover:bg-dark-border/50 dark:border-dark-border/50 ${
                  !notification.read ? "bg-ocean/5 dark:bg-ocean/10" : ""
                }`}
              >
                <div className="mt-0.5 flex-shrink-0" aria-hidden="true">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${
                        !notification.read
                          ? "font-semibold text-storm dark:text-dark-text"
                          : "font-medium text-storm-light dark:text-dark-text-secondary"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span
                        className="flex-shrink-0 h-2 w-2 rounded-full bg-ocean mt-1.5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-xs text-storm-light mt-0.5 line-clamp-2 dark:text-dark-text-secondary">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 dark:text-dark-text-secondary/70">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </button>
            ))}
            {totalCount > 10 && (
              <div className="px-4 py-3 text-center">
                <button
                  onClick={() => {
                    router.push("/notifications");
                    onClose();
                  }}
                  className="text-sm text-ocean hover:text-ocean/80 font-medium dark:text-ocean-light dark:hover:text-ocean-light/80"
                >
                  View all notifications
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
