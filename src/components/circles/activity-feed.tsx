'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  DollarSign,
  FileText,
  Vote,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  MessageCircle,
  Clock,
} from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  actorId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <DollarSign className="w-4 h-4" />;
      case 'proposal_created':
        return <FileText className="w-4 h-4" />;
      case 'vote_cast':
        return <Vote className="w-4 h-4" />;
      case 'proposal_approved':
      case 'proposal_funded':
        return <CheckCircle className="w-4 h-4" />;
      case 'proposal_rejected':
        return <XCircle className="w-4 h-4" />;
      case 'proposal_expired':
        return <Clock className="w-4 h-4" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4" />;
      case 'member_left':
        return <UserMinus className="w-4 h-4" />;
      case 'discussion':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'bg-teal/10 text-teal';
      case 'proposal_created':
      case 'vote_cast':
        return 'bg-ocean/10 dark:bg-sky/10 text-ocean dark:text-sky';
      case 'proposal_approved':
      case 'proposal_funded':
        return 'bg-teal/10 text-teal';
      case 'proposal_rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-500';
      case 'proposal_expired':
        return 'bg-gray-100 text-storm/50';
      case 'member_joined':
        return 'bg-gold/10 text-gold';
      case 'member_left':
        return 'bg-gray-100 text-storm/50';
      case 'discussion':
        return 'bg-sky/10 text-sky';
      default:
        return 'bg-gray-100 text-storm/70';
    }
  };

  const formatMessage = (type: string, data: Record<string, unknown>): string => {
    switch (type) {
      case 'contribution':
        return `${data.name || 'A member'} contributed $${(data.amount as number)?.toFixed(2) || '0.00'}`;
      case 'proposal_created':
        return `${data.proposerName || 'A member'} proposed: "${data.title}"`;
      case 'vote_cast':
        return `${data.voterName || 'A member'} voted on "${data.proposalTitle}"`;
      case 'proposal_approved':
        return `Proposal "${data.title}" was approved`;
      case 'proposal_funded':
        return `$${(data.amount as number)?.toFixed(2) || '0.00'} deployed to "${data.title}"`;
      case 'proposal_rejected':
        return `Proposal "${data.title}" was not approved`;
      case 'proposal_expired':
        return `Proposal "${data.title}" expired`;
      case 'member_joined':
        return `${data.name || 'A new member'} joined the circle`;
      case 'member_left':
        return `${data.name || 'A member'} left the circle`;
      case 'discussion':
        return `${data.authorName || 'A member'} started a discussion`;
      default:
        return 'Activity in the circle';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-storm-light dark:text-dark-text-secondary">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-foam/5 rounded-lg"
        >
          <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-storm dark:text-dark-text">
              {formatMessage(activity.type, activity.data)}
            </p>
            <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-0.5">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
