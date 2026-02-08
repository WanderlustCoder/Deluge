'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface A11yPreferences {
  fontSize: string;
  fontFamily: string;
  lineSpacing: string;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

const FONT_SIZES = [
  { value: 'small', label: 'Small', sample: 'text-sm' },
  { value: 'medium', label: 'Medium (Default)', sample: 'text-base' },
  { value: 'large', label: 'Large', sample: 'text-lg' },
  { value: 'xl', label: 'Extra Large', sample: 'text-xl' },
];

const FONT_FAMILIES = [
  { value: 'default', label: 'Default', desc: 'System font' },
  { value: 'dyslexic', label: 'Dyslexia-Friendly', desc: 'OpenDyslexic' },
  { value: 'mono', label: 'Monospace', desc: 'Fixed-width characters' },
];

const LINE_SPACINGS = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal (Default)' },
  { value: 'relaxed', label: 'Relaxed' },
];

export default function AccessibilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<A11yPreferences>({
    fontSize: 'medium',
    fontFamily: 'default',
    lineSpacing: 'normal',
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/account/accessibility');
        if (res.ok) {
          const data = await res.json();
          if (data.preferences) {
            setPreferences(data.preferences);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/account/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        // Apply preferences immediately
        applyPreferences(preferences);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  }

  function applyPreferences(prefs: A11yPreferences) {
    // Apply to document
    document.documentElement.style.setProperty(
      '--font-size-multiplier',
      prefs.fontSize === 'small'
        ? '0.875'
        : prefs.fontSize === 'large'
          ? '1.125'
          : prefs.fontSize === 'xl'
            ? '1.25'
            : '1'
    );

    if (prefs.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (prefs.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-storm/20 rounded w-1/3" />
          <div className="h-64 bg-storm/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean dark:text-sky">Accessibility Settings</h1>
        <p className="text-storm/70 dark:text-foam/70 mt-1">
          Customize your experience to make Deluge easier to use
        </p>
      </div>

      <div className="space-y-8">
        {/* Text Size */}
        <section>
          <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">Text Size</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FONT_SIZES.map((size) => (
              <motion.button
                key={size.value}
                whileHover={{ scale: 1.02 }}
                onClick={() => setPreferences((p) => ({ ...p, fontSize: size.value }))}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  preferences.fontSize === size.value
                    ? 'border-ocean bg-ocean/10 dark:bg-ocean/20'
                    : 'border-storm/20 dark:border-storm/40 hover:border-ocean/50'
                }`}
              >
                <p className={`font-medium text-storm dark:text-foam ${size.sample}`}>
                  {size.label}
                </p>
                <p className={`text-storm/60 dark:text-foam/60 ${size.sample}`}>
                  Sample text
                </p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Font Family */}
        <section>
          <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">Font Style</h2>
          <div className="space-y-3">
            {FONT_FAMILIES.map((font) => (
              <motion.button
                key={font.value}
                whileHover={{ scale: 1.01 }}
                onClick={() => setPreferences((p) => ({ ...p, fontFamily: font.value }))}
                className={`w-full p-4 rounded-xl border text-left transition-colors ${
                  preferences.fontFamily === font.value
                    ? 'border-ocean bg-ocean/10 dark:bg-ocean/20'
                    : 'border-storm/20 dark:border-storm/40 hover:border-ocean/50'
                }`}
              >
                <p className="font-medium text-storm dark:text-foam">{font.label}</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">{font.desc}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Line Spacing */}
        <section>
          <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">Line Spacing</h2>
          <div className="grid grid-cols-3 gap-3">
            {LINE_SPACINGS.map((spacing) => (
              <motion.button
                key={spacing.value}
                whileHover={{ scale: 1.02 }}
                onClick={() => setPreferences((p) => ({ ...p, lineSpacing: spacing.value }))}
                className={`p-4 rounded-xl border text-center transition-colors ${
                  preferences.lineSpacing === spacing.value
                    ? 'border-ocean bg-ocean/10 dark:bg-ocean/20'
                    : 'border-storm/20 dark:border-storm/40 hover:border-ocean/50'
                }`}
              >
                <p className="font-medium text-storm dark:text-foam text-sm">{spacing.label}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Toggle Options */}
        <section>
          <h2 className="text-xl font-semibold text-storm dark:text-foam mb-4">Display Options</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border border-storm/20 dark:border-storm/40">
              <div>
                <p className="font-medium text-storm dark:text-foam">High Contrast Mode</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">
                  Increase contrast for better visibility
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, highContrast: e.target.checked }))
                }
                className="w-5 h-5 rounded border-storm/30 text-ocean focus:ring-ocean"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-storm/20 dark:border-storm/40">
              <div>
                <p className="font-medium text-storm dark:text-foam">Reduce Motion</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">
                  Minimize animations and transitions
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, reducedMotion: e.target.checked }))
                }
                className="w-5 h-5 rounded border-storm/30 text-ocean focus:ring-ocean"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-storm/20 dark:border-storm/40">
              <div>
                <p className="font-medium text-storm dark:text-foam">Screen Reader Optimizations</p>
                <p className="text-sm text-storm/60 dark:text-foam/60">
                  Enhanced support for assistive technologies
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.screenReader}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, screenReader: e.target.checked }))
                }
                className="w-5 h-5 rounded border-storm/30 text-ocean focus:ring-ocean"
              />
            </label>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-storm/10 dark:border-storm/30">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-storm/5 dark:bg-storm/20 rounded-lg p-4">
          <h3 className="font-medium text-storm dark:text-foam mb-2">Keyboard Shortcuts</h3>
          <ul className="text-sm text-storm/70 dark:text-foam/70 space-y-1">
            <li>
              <kbd className="px-2 py-0.5 bg-storm/10 rounded text-xs">Tab</kbd> — Move to next
              interactive element
            </li>
            <li>
              <kbd className="px-2 py-0.5 bg-storm/10 rounded text-xs">Shift + Tab</kbd> — Move to
              previous element
            </li>
            <li>
              <kbd className="px-2 py-0.5 bg-storm/10 rounded text-xs">Enter</kbd> or{' '}
              <kbd className="px-2 py-0.5 bg-storm/10 rounded text-xs">Space</kbd> — Activate
              buttons
            </li>
            <li>
              <kbd className="px-2 py-0.5 bg-storm/10 rounded text-xs">Escape</kbd> — Close dialogs
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
