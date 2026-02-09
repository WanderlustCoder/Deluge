'use client';

import { useState } from 'react';
import { Webhook, Settings, Play, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/lib/i18n/formatting';

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string;
  status: string;
  failureCount: number;
  lastTriggeredAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  createdAt: string;
}

interface WebhookCardProps {
  webhook: WebhookData;
  onEdit: (id: string) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  onRotateSecret: (id: string) => void;
}

export function WebhookCard({
  webhook,
  onEdit,
  onTest,
  onDelete,
  onRotateSecret,
}: WebhookCardProps) {
  const events = webhook.events.split(',');
  const isActive = webhook.status === 'active';
  const isFailed = webhook.status === 'failed';
  const isPaused = webhook.status === 'paused';

  const getStatusColor = () => {
    if (isActive) return 'text-teal';
    if (isFailed) return 'text-red-500';
    return 'text-storm/50';
  };

  const getStatusIcon = () => {
    if (isActive) return <CheckCircle className="w-4 h-4" />;
    if (isFailed) return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-teal/10' : 'bg-gray-100'}`}>
            <Webhook className={`w-5 h-5 ${isActive ? 'text-teal' : 'text-storm/50'}`} />
          </div>
          <div>
            <h3 className="font-medium text-ocean dark:text-sky">{webhook.name}</h3>
            <p className="text-sm text-storm/60 break-all">{webhook.url}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1 text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="capitalize">{webhook.status}</span>
        </div>
      </div>

      {isFailed && webhook.lastError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Failed after {webhook.failureCount} attempts
              </p>
              <p className="text-sm text-red-500/80 mt-1">{webhook.lastError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <span className="text-sm text-storm/60">Events</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {events.map((event) => (
            <span
              key={event}
              className="px-2 py-0.5 text-xs font-medium bg-ocean/10 text-ocean dark:bg-sky/10 dark:text-sky rounded"
            >
              {event}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-storm/60">Last Triggered</span>
          <p className="font-medium">
            {webhook.lastTriggeredAt
              ? formatDateTime(webhook.lastTriggeredAt)
              : 'Never'}
          </p>
        </div>
        <div>
          <span className="text-storm/60">Last Success</span>
          <p className="font-medium">
            {webhook.lastSuccessAt
              ? formatDateTime(webhook.lastSuccessAt)
              : 'Never'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
        <button
          onClick={() => onTest(webhook.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ocean hover:bg-ocean/10 rounded transition-colors"
        >
          <Play className="w-4 h-4" />
          Test
        </button>
        <button
          onClick={() => onEdit(webhook.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-storm/70 hover:bg-gray-100 rounded transition-colors"
        >
          <Settings className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onRotateSecret(webhook.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-storm/70 hover:bg-gray-100 rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Rotate Secret
        </button>
        <button
          onClick={() => onDelete(webhook.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
