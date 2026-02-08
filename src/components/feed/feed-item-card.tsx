"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  DollarSign,
  Trophy,
  FileText,
  Users,
  Lightbulb,
  Milestone,
  Megaphone,
  CreditCard,
} from "lucide-react";

interface FeedItem {
  id: string;
  actionType: string;
  title: string;
  description?: string;
  projectId?: string;
  communityId?: string;
  loanId?: string;
  read: boolean;
  createdAt: string;
}

interface FeedItemCardProps {
  item: FeedItem;
  onRead?: () => void;
}

const ACTION_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  funded: {
    icon: DollarSign,
    color: "text-teal",
    bgColor: "bg-teal/10",
  },
  cascaded: {
    icon: Trophy,
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
  posted_update: {
    icon: FileText,
    color: "text-sky",
    bgColor: "bg-sky/10",
  },
  joined_community: {
    icon: Users,
    color: "text-ocean",
    bgColor: "bg-ocean/10",
  },
  proposed_project: {
    icon: Lightbulb,
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
  milestone: {
    icon: Milestone,
    color: "text-teal",
    bgColor: "bg-teal/10",
  },
  rally_created: {
    icon: Megaphone,
    color: "text-sky",
    bgColor: "bg-sky/10",
  },
  loan_funded: {
    icon: CreditCard,
    color: "text-teal",
    bgColor: "bg-teal/10",
  },
};

export function FeedItemCard({ item, onRead }: FeedItemCardProps) {
  const config = ACTION_CONFIG[item.actionType] || {
    icon: FileText,
    color: "text-storm",
    bgColor: "bg-storm/10",
  };

  const Icon = config.icon;

  function getLink(): string | null {
    if (item.projectId) return `/projects/${item.projectId}`;
    if (item.communityId) return `/communities/${item.communityId}`;
    if (item.loanId) return `/loans/${item.loanId}`;
    return null;
  }

  const link = getLink();

  function handleClick() {
    if (!item.read) {
      onRead?.();
    }
  }

  const content = (
    <div
      className={`flex gap-3 p-4 rounded-lg border transition ${
        item.read
          ? "border-storm/10 bg-white dark:bg-storm/5"
          : "border-sky/30 bg-sky/5"
      } hover:border-sky/50`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            item.read ? "text-storm" : "text-ocean dark:text-white font-medium"
          }`}
        >
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-storm-light mt-0.5 line-clamp-2">
            {item.description}
          </p>
        )}
        <p className="text-xs text-storm-light mt-1">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread indicator */}
      {!item.read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-sky" />
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
