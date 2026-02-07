'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Building2, Palette, CreditCard, Gift, Save } from 'lucide-react';

interface CorporateSettings {
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  adminEmail: string;
  billingEmail: string | null;
  matchingRatio: number;
  matchingCategories: string[];
  employeeLimit: number | null;
}

export default function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [settings, setSettings] = useState<CorporateSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, [slug]);

  const loadSettings = async () => {
    try {
      const res = await fetch(`/api/corporate/${slug}`);
      if (res.ok) {
        const data = await res.json();
        const account = data.account;
        setSettings({
          name: account.name,
          slug: account.slug,
          logoUrl: account.logoUrl,
          primaryColor: account.primaryColor || '#0D47A1',
          secondaryColor: account.secondaryColor,
          adminEmail: account.adminEmail,
          billingEmail: account.billingEmail,
          matchingRatio: account.matchingRatio,
          matchingCategories: account.matchingCategories
            ? JSON.parse(account.matchingCategories)
            : [],
          employeeLimit: account.employeeLimit,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/corporate/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          logoUrl: settings.logoUrl,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          billingEmail: settings.billingEmail,
          matchingRatio: settings.matchingRatio,
          matchingCategories: JSON.stringify(settings.matchingCategories),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-storm/10 rounded w-1/4" />
        <div className="h-96 bg-storm/10 rounded-xl" />
      </div>
    );
  }

  const categories = [
    'Environment',
    'Education',
    'Health',
    'Community',
    'Arts',
    'Youth',
    'Seniors',
    'Housing',
    'Food Security',
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-ocean dark:text-sky">
          Settings
        </h1>
        <p className="text-storm/60 dark:text-foam/60">
          Manage your corporate account settings
        </p>
      </motion.div>

      {/* Alerts */}
      {success && (
        <div className="bg-teal/10 text-teal p-4 rounded-lg text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Company Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-ocean dark:text-sky" />
          <h2 className="font-semibold text-ocean dark:text-sky">Company Information</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Billing Email
            </label>
            <input
              type="email"
              value={settings.billingEmail || ''}
              onChange={(e) => setSettings({ ...settings, billingEmail: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={settings.logoUrl || ''}
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
          />
        </div>
      </motion.div>

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-5 h-5 text-ocean dark:text-sky" />
          <h2 className="font-semibold text-ocean dark:text-sky">Branding</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor || '#00897B'}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.secondaryColor || ''}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                placeholder="#00897B"
                className="flex-1 px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Matching Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-5 h-5 text-ocean dark:text-sky" />
          <h2 className="font-semibold text-ocean dark:text-sky">Matching Settings</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Matching Ratio
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={settings.matchingRatio}
              onChange={(e) =>
                setSettings({ ...settings, matchingRatio: parseFloat(e.target.value) || 0 })
              }
              className="w-24 px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
            />
            <span className="text-storm/60 dark:text-foam/60">: 1</span>
          </div>
          <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
            For every $1 an employee contributes, you match ${settings.matchingRatio}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
            Eligible Categories
          </label>
          <p className="text-xs text-storm/50 dark:text-foam/50 mb-3">
            Select which project categories are eligible for matching. Leave empty for all categories.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  const current = settings.matchingCategories;
                  const updated = current.includes(category)
                    ? current.filter((c) => c !== category)
                    : [...current, category];
                  setSettings({ ...settings, matchingCategories: updated });
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  settings.matchingCategories.includes(category)
                    ? 'bg-ocean dark:bg-sky text-white'
                    : 'bg-storm/10 dark:bg-foam/10 text-storm/70 dark:text-foam/70 hover:bg-storm/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>
    </div>
  );
}
