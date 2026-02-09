'use client';

import { motion } from 'framer-motion';
import { Package, DollarSign, Clock, CheckCircle, XCircle, Inbox } from 'lucide-react';

interface InKindDonation {
  id: string;
  type: string;
  description: string;
  value: number | null;
  notes: string | null;
  status: string;
  offeredAt: string;
  receivedAt: string | null;
  donor: {
    name: string;
  };
  project: {
    title: string;
  };
}

interface InKindCardProps {
  donation: InKindDonation;
  showProject?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onMarkReceived?: () => void;
}

export function InKindCard({
  donation,
  showProject = true,
  onAccept,
  onDecline,
  onMarkReceived,
}: InKindCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'offered':
        return { icon: Clock, color: 'text-gold', bg: 'bg-gold/10', label: 'Offered' };
      case 'accepted':
        return { icon: CheckCircle, color: 'text-sky', bg: 'bg-sky/10', label: 'Accepted' };
      case 'received':
        return { icon: Package, color: 'text-teal', bg: 'bg-teal/10', label: 'Received' };
      case 'declined':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Declined' };
      default:
        return { icon: Inbox, color: 'text-storm/50', bg: 'bg-gray-100', label: status };
    }
  };

  const statusConfig = getStatusConfig(donation.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const typeLabels: Record<string, string> = {
    goods: 'Goods',
    services: 'Services',
    materials: 'Materials',
    equipment: 'Equipment',
    space: 'Space/Venue',
    food: 'Food',
    other: 'Other',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-border/50 rounded-xl p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-gray-100 dark:bg-foam/10 px-2 py-0.5 rounded">
              {typeLabels[donation.type] || donation.type}
            </span>
            <div className={`flex items-center gap-1 ${statusConfig.color} text-xs`}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </div>
          </div>
          <p className="font-medium text-ocean dark:text-sky mt-2">
            {donation.description}
          </p>
          {showProject && (
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              for {donation.project.title}
            </p>
          )}
        </div>
        {donation.value && (
          <div className="flex items-center gap-1 text-teal">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">{donation.value.toFixed(0)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-storm-light dark:text-dark-text-secondary">
        <span>From {donation.donor.name}</span>
        <span>{formatDate(donation.offeredAt)}</span>
      </div>

      {donation.notes && (
        <p className="text-sm text-storm-light dark:text-dark-text-secondary mt-2 pt-2 border-t border-gray-200 dark:border-foam/10">
          {donation.notes}
        </p>
      )}

      {/* Action buttons for project coordinators */}
      {(onAccept || onDecline || onMarkReceived) && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-foam/10">
          {donation.status === 'offered' && onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 py-1.5 bg-teal text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Accept
            </button>
          )}
          {donation.status === 'offered' && onDecline && (
            <button
              onClick={onDecline}
              className="flex-1 py-1.5 border border-red-200 text-red-500 rounded text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Decline
            </button>
          )}
          {donation.status === 'accepted' && onMarkReceived && (
            <button
              onClick={onMarkReceived}
              className="flex-1 py-1.5 bg-ocean dark:bg-sky text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Mark as Received
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
