'use client';

import { useState } from 'react';
import { Key, Copy, Trash2, Eye, EyeOff, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  rateLimit: number;
  status: string;
  lastUsedAt: string | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

interface ApiKeyCardProps {
  apiKey: ApiKey;
  fullKey?: string; // Only provided when just created
  onRevoke: (id: string) => void;
}

export function ApiKeyCard({ apiKey, fullKey, onRevoke }: ApiKeyCardProps) {
  const [showKey, setShowKey] = useState(!!fullKey);
  const [copied, setCopied] = useState(false);

  const scopes = apiKey.scopes.split(',');
  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();
  const isActive = apiKey.status === 'active' && !isExpired;

  const handleCopy = async () => {
    if (fullKey) {
      await navigator.clipboard.writeText(fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-storm/20 rounded-lg p-4 bg-foam dark:bg-storm/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-teal/10' : 'bg-storm/10'}`}>
            <Key className={`w-5 h-5 ${isActive ? 'text-teal' : 'text-storm/50'}`} />
          </div>
          <div>
            <h3 className="font-medium text-ocean dark:text-sky">{apiKey.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-storm/70 bg-storm/10 px-2 py-0.5 rounded">
                {fullKey && showKey ? fullKey : `${apiKey.keyPrefix}...`}
              </code>
              {fullKey && (
                <>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 hover:bg-storm/10 rounded"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-storm/10 rounded"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-teal" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="flex items-center gap-1 text-sm text-teal">
              <CheckCircle className="w-4 h-4" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-red-500">
              <XCircle className="w-4 h-4" /> {isExpired ? 'Expired' : 'Revoked'}
            </span>
          )}
        </div>
      </div>

      {fullKey && (
        <div className="mt-3 p-3 bg-gold/10 border border-gold/30 rounded-lg">
          <p className="text-sm text-gold font-medium">
            Save this API key now. It won&apos;t be shown again.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {scopes.map((scope) => (
          <span
            key={scope}
            className="px-2 py-0.5 text-xs font-medium bg-ocean/10 text-ocean dark:bg-sky/10 dark:text-sky rounded"
          >
            {scope}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-storm/60">Rate Limit</span>
          <p className="font-medium">{apiKey.rateLimit.toLocaleString()}/hr</p>
        </div>
        <div>
          <span className="text-storm/60">Usage</span>
          <p className="font-medium">{apiKey.usageCount.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-storm/60">Last Used</span>
          <p className="font-medium">
            {apiKey.lastUsedAt
              ? new Date(apiKey.lastUsedAt).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
        <div>
          <span className="text-storm/60">Expires</span>
          <p className="font-medium">
            {apiKey.expiresAt
              ? new Date(apiKey.expiresAt).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="mt-4 pt-4 border-t border-storm/10 flex justify-end">
          <button
            onClick={() => onRevoke(apiKey.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Revoke
          </button>
        </div>
      )}
    </div>
  );
}
