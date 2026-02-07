'use client';

import { useState, useEffect } from 'react';
import { Webhook, Plus, AlertCircle, Activity } from 'lucide-react';
import { WebhookCard } from '@/components/developer/webhook-card';
import { CreateWebhookModal } from '@/components/developer/create-webhook-modal';
import { WebhookTestResult } from '@/components/developer/webhook-test-result';

interface WebhookData {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string;
  status: string;
  failureCount: number;
  lastTriggeredAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  failed: number;
  deliveriesLast24h: number;
}

interface TestResult {
  success: boolean;
  statusCode?: number;
  duration?: number;
  responseBody?: string;
  error?: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/developer/webhooks');
      const data = await res.json();
      setWebhooks(data.webhooks || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (created: { id: string; secret: string; name: string; url?: string; events?: string }) => {
    // Convert to WebhookData format - the API returns full webhook data
    const webhook: WebhookData = {
      id: created.id,
      name: created.name,
      url: created.url || '',
      events: created.events || '',
      status: 'active',
      failureCount: 0,
      lastTriggeredAt: null,
      lastSuccessAt: null,
      lastError: null,
      createdAt: new Date().toISOString(),
    };
    setWebhooks((prev) => [webhook, ...prev]);
    setNewWebhookSecret(created.secret);
    setShowModal(false);
    // Refetch to get full data
    fetchWebhooks();
  };

  const handleEdit = (id: string) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/developer/webhooks/${id}`;
  };

  const handleTest = async (id: string) => {
    try {
      const res = await fetch(`/api/developer/webhooks/${id}/test`, {
        method: 'POST',
      });
      const result = await res.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to send test webhook',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      await fetch(`/api/developer/webhooks/${id}`, { method: 'DELETE' });
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleRotateSecret = async (id: string) => {
    if (!confirm('Rotating the secret will require updating your endpoint. Continue?')) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/webhooks/${id}/rotate`, {
        method: 'POST',
      });
      const { secret } = await res.json();
      alert(`New secret: ${secret}\n\nSave this secret - it won't be shown again.`);
    } catch (error) {
      console.error('Error rotating secret:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Webhook className="w-6 h-6" />
              Webhooks
            </h1>
            <p className="text-storm/60 mt-1">
              Receive real-time notifications when events occur
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Webhook
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-foam dark:bg-storm/20 border border-storm/10 rounded-lg">
              <p className="text-sm text-storm/60">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-foam dark:bg-storm/20 border border-storm/10 rounded-lg">
              <p className="text-sm text-storm/60">Active</p>
              <p className="text-2xl font-bold text-teal">{stats.active}</p>
            </div>
            <div className="p-4 bg-foam dark:bg-storm/20 border border-storm/10 rounded-lg">
              <p className="text-sm text-storm/60">Failed</p>
              <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
            </div>
            <div className="p-4 bg-foam dark:bg-storm/20 border border-storm/10 rounded-lg">
              <p className="text-sm text-storm/60">Last 24h</p>
              <p className="text-2xl font-bold">{stats.deliveriesLast24h}</p>
            </div>
          </div>
        )}

        {/* New webhook secret display */}
        {newWebhookSecret && (
          <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gold">Save your webhook secret</p>
                <p className="text-sm text-storm/70 mt-1 mb-2">
                  This secret is used to verify webhook signatures. It won&apos;t be shown again.
                </p>
                <code className="block p-2 bg-storm/10 rounded font-mono text-sm break-all">
                  {newWebhookSecret}
                </code>
                <button
                  onClick={() => setNewWebhookSecret(null)}
                  className="mt-2 text-sm text-storm/60 hover:text-storm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-sky/10 border border-sky/30 rounded-lg flex items-start gap-3">
          <Activity className="w-5 h-5 text-sky mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-storm">Webhook Security</p>
            <p className="text-storm/70 mt-1">
              All webhook payloads are signed with HMAC-SHA256. Verify the{' '}
              <code className="bg-storm/10 px-1 rounded">X-Webhook-Signature</code> header
              to ensure authenticity.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-storm/20 rounded-xl">
            <Webhook className="w-12 h-12 text-storm/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No webhooks yet</h2>
            <p className="text-storm/60 mb-4">
              Create a webhook to receive real-time event notifications
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onEdit={handleEdit}
                onTest={handleTest}
                onDelete={handleDelete}
                onRotateSecret={handleRotateSecret}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWebhookModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />

      <WebhookTestResult
        result={testResult}
        onClose={() => setTestResult(null)}
      />
    </div>
  );
}
