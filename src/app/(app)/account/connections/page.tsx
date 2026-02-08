'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SOCIAL_PROVIDERS, SocialProvider } from '@/lib/social';

interface ConnectedAccount {
  id: string;
  provider: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  connectedAt: string;
  lastSyncAt?: string;
}

export default function ConnectionsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/social/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect(provider: SocialProvider) {
    try {
      const res = await fetch(`/api/social/accounts?provider=${provider}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.provider !== provider));
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
    }
  }

  function handleConnect(provider: SocialProvider) {
    // OAuth connection would be handled here
    alert(`OAuth connection for ${provider} coming soon`);
  }

  const connectedProviders = new Set(accounts.map((a) => a.provider));

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Connected Accounts
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage your social media connections for easier login and sharing.
      </p>

      <div className="space-y-4">
        {(Object.keys(SOCIAL_PROVIDERS) as SocialProvider[]).map((provider, index) => {
          const info = SOCIAL_PROVIDERS[provider];
          const account = accounts.find((a) => a.provider === provider);
          const isConnected = connectedProviders.has(provider);

          return (
            <motion.div
              key={provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {info.name}
                  </h3>
                  {isConnected && account ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.email || account.name || 'Connected'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Not connected
                    </p>
                  )}
                </div>
              </div>

              {isConnected ? (
                <button
                  onClick={() => handleDisconnect(provider)}
                  className="px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(provider)}
                  className="px-4 py-2 text-sm bg-ocean text-white rounded-lg hover:bg-ocean/90"
                >
                  Connect
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          Why connect accounts?
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Faster login with social sign-in</li>
          <li>• Easy sharing to your social networks</li>
          <li>• Find friends who are already on Deluge</li>
          <li>• Import your profile picture and info</li>
        </ul>
      </div>
    </div>
  );
}
