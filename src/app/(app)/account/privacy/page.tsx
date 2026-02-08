'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PrivacySettings {
  profileVisibility: string;
  showGivingHistory: boolean;
  showBadges: boolean;
  showCommunities: boolean;
  allowTagging: boolean;
  allowMessages: string;
  showOnLeaderboards: boolean;
  dataRetention: string;
}

interface ConsentRecord {
  consentType: string;
  granted: boolean;
  version: string;
  grantedAt?: string;
}

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [settingsRes, consentsRes] = await Promise.all([
        fetch('/api/privacy/settings'),
        fetch('/api/privacy/consent'),
      ]);

      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }

      if (consentsRes.ok) {
        const data = await consentsRes.json();
        setConsents(data.consents || []);
      }
    } catch (error) {
      console.error('Error fetching privacy data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/privacy/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  }

  async function handleConsentChange(type: string, granted: boolean) {
    try {
      const res = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consents: { [type]: granted },
        }),
      });

      if (res.ok) {
        setConsents((prev) =>
          prev.map((c) =>
            c.consentType === type ? { ...c, granted } : c
          )
        );
      }
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Privacy Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Control how your information is shared and used
      </p>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Profile Visibility */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Visibility
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Who can see your profile?
            </label>
            <select
              value={settings?.profileVisibility ?? 'public'}
              onChange={(e) =>
                setSettings((s) => s ? { ...s, profileVisibility: e.target.value } : null)
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="public">Public - Anyone</option>
              <option value="community">Community - Only community members</option>
              <option value="private">Private - Only you</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show giving history</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Display projects you&apos;ve funded</p>
            </div>
            <Toggle
              checked={settings?.showGivingHistory ?? false}
              onChange={(checked) =>
                setSettings((s) => s ? { ...s, showGivingHistory: checked } : null)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show badges</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Display earned badges on profile</p>
            </div>
            <Toggle
              checked={settings?.showBadges ?? true}
              onChange={(checked) =>
                setSettings((s) => s ? { ...s, showBadges: checked } : null)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show communities</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Display community memberships</p>
            </div>
            <Toggle
              checked={settings?.showCommunities ?? true}
              onChange={(checked) =>
                setSettings((s) => s ? { ...s, showCommunities: checked } : null)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show on leaderboards</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Appear in community rankings</p>
            </div>
            <Toggle
              checked={settings?.showOnLeaderboards ?? true}
              onChange={(checked) =>
                setSettings((s) => s ? { ...s, showOnLeaderboards: checked } : null)
              }
            />
          </div>
        </div>
      </section>

      {/* Communication */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Communication
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Allow tagging</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Others can @mention you</p>
            </div>
            <Toggle
              checked={settings?.allowTagging ?? true}
              onChange={(checked) =>
                setSettings((s) => s ? { ...s, allowTagging: checked } : null)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Who can message you?
            </label>
            <select
              value={settings?.allowMessages ?? 'followers'}
              onChange={(e) =>
                setSettings((s) => s ? { ...s, allowMessages: e.target.value } : null)
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="anyone">Anyone</option>
              <option value="followers">People you follow</option>
              <option value="none">No one</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data Consents */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data & Cookies
        </h2>

        <div className="space-y-4">
          <ConsentToggle
            type="analytics"
            label="Analytics"
            description="Help us improve by allowing usage analytics"
            consents={consents}
            onChange={handleConsentChange}
          />
          <ConsentToggle
            type="marketing"
            label="Marketing emails"
            description="Receive updates about new features and campaigns"
            consents={consents}
            onChange={handleConsentChange}
          />
          <ConsentToggle
            type="third_party"
            label="Third-party services"
            description="Allow integration with partner services"
            consents={consents}
            onChange={handleConsentChange}
          />
        </div>
      </section>

      {/* Data Retention */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Retention
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How long should we keep your data?
          </label>
          <select
            value={settings?.dataRetention ?? 'indefinite'}
            onChange={(e) =>
              setSettings((s) => s ? { ...s, dataRetention: e.target.value } : null)
            }
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1y">1 year</option>
            <option value="3y">3 years</option>
            <option value="5y">5 years</option>
            <option value="indefinite">Until I delete my account</option>
          </select>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        disabled={saving}
        className="w-full py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Privacy Settings'}
      </button>

      {/* Data Actions */}
      <section className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Data
        </h2>

        <div className="space-y-3">
          <a
            href="/account/privacy/data"
            className="block w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-center"
          >
            Download My Data
          </a>
          <a
            href="/account/privacy/delete"
            className="block w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-center"
          >
            Delete My Account
          </a>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-ocean' : 'bg-gray-200 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function ConsentToggle({
  type,
  label,
  description,
  consents,
  onChange,
}: {
  type: string;
  label: string;
  description: string;
  consents: ConsentRecord[];
  onChange: (type: string, granted: boolean) => void;
}) {
  const consent = consents.find((c) => c.consentType === type);
  const granted = consent?.granted ?? false;

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Toggle checked={granted} onChange={(checked) => onChange(type, checked)} />
    </div>
  );
}
