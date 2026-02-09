'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, AlertCircle } from 'lucide-react';
import { ApiKeyCard } from '@/components/developer/api-key-card';
import { CreateKeyModal } from '@/components/developer/create-key-modal';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  key?: string;
  scopes: string;
  rateLimit: number;
  status: string;
  lastUsedAt: string | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/developer/keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (createdKey: {
    id: string;
    name: string;
    key: string;
    prefix: string;
    scopes: string[];
    rateLimit: number;
    expiresAt: string | null;
    createdAt: string;
  }) => {
    // Convert to ApiKey format
    const key: ApiKey = {
      id: createdKey.id,
      name: createdKey.name,
      keyPrefix: createdKey.prefix,
      key: createdKey.key,
      scopes: createdKey.scopes.join(','),
      rateLimit: createdKey.rateLimit,
      status: 'active',
      lastUsedAt: null,
      usageCount: 0,
      expiresAt: createdKey.expiresAt,
      createdAt: createdKey.createdAt,
    };
    setNewKey(key);
    setKeys((prev) => [key, ...prev]);
    setShowModal(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      return;
    }

    try {
      await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' });
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k))
      );
    } catch (error) {
      console.error('Error revoking key:', error);
    }
  };

  const activeKeys = keys.filter((k) => k.status === 'active');
  const revokedKeys = keys.filter((k) => k.status !== 'active');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="w-6 h-6" />
              API Keys
            </h1>
            <p className="text-storm/60 mt-1">
              Create and manage API keys to authenticate your requests
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-sky/10 border border-sky/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-sky mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-storm">Keep your API keys secure</p>
            <p className="text-storm/70 mt-1">
              API keys grant access to your account. Never share them publicly or commit
              them to version control. Use environment variables instead.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <Key className="w-12 h-12 text-storm/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No API keys yet</h2>
            <p className="text-storm/60 mb-4">
              Create an API key to start making requests
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Key
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* New key just created */}
            {newKey && (
              <div className="space-y-4">
                <h2 className="font-semibold text-teal">Just Created</h2>
                <ApiKeyCard
                  apiKey={newKey}
                  fullKey={newKey.key}
                  onRevoke={handleRevoke}
                />
              </div>
            )}

            {/* Active keys */}
            {activeKeys.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold">Active Keys ({activeKeys.length})</h2>
                {activeKeys
                  .filter((k) => k.id !== newKey?.id)
                  .map((key) => (
                    <ApiKeyCard
                      key={key.id}
                      apiKey={key}
                      onRevoke={handleRevoke}
                    />
                  ))}
              </div>
            )}

            {/* Revoked keys */}
            {revokedKeys.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-storm/50">
                  Revoked Keys ({revokedKeys.length})
                </h2>
                {revokedKeys.map((key) => (
                  <ApiKeyCard
                    key={key.id}
                    apiKey={key}
                    onRevoke={handleRevoke}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateKeyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
