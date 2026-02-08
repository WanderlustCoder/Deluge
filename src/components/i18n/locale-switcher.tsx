'use client';

import { useState } from 'react';
import { LOCALE_NAMES, Locale, SUPPORTED_LOCALES, getLocaleDirection } from '@/lib/i18n/config';

interface LocaleSwitcherProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function LocaleSwitcher({ currentLocale, onLocaleChange }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam hover:bg-storm/5 dark:hover:bg-storm/40"
      >
        <span className="text-lg" aria-hidden="true">
          🌐
        </span>
        <span>{LOCALE_NAMES[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Select language"
            className="absolute top-full left-0 mt-1 w-48 py-1 bg-white dark:bg-storm/90 border border-storm/20 dark:border-storm/40 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <li key={locale}>
                <button
                  role="option"
                  aria-selected={locale === currentLocale}
                  onClick={() => {
                    onLocaleChange(locale);
                    setIsOpen(false);
                  }}
                  dir={getLocaleDirection(locale)}
                  className={`w-full text-left px-4 py-2 hover:bg-storm/5 dark:hover:bg-storm/40 ${
                    locale === currentLocale
                      ? 'bg-ocean/10 text-ocean dark:text-sky'
                      : 'text-storm dark:text-foam'
                  }`}
                >
                  {LOCALE_NAMES[locale]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Compact version (icon only)
export function LocaleSwitcherCompact({ currentLocale, onLocaleChange }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${LOCALE_NAMES[currentLocale]}. Click to change.`}
        className="p-2 rounded-lg border border-storm/20 dark:border-storm/40 bg-white dark:bg-storm/30 text-storm dark:text-foam hover:bg-storm/5 dark:hover:bg-storm/40"
      >
        <span className="text-lg">🌐</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Select language"
            className="absolute top-full right-0 mt-1 w-40 py-1 bg-white dark:bg-storm/90 border border-storm/20 dark:border-storm/40 rounded-lg shadow-lg z-20"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <li key={locale}>
                <button
                  role="option"
                  aria-selected={locale === currentLocale}
                  onClick={() => {
                    onLocaleChange(locale);
                    setIsOpen(false);
                  }}
                  dir={getLocaleDirection(locale)}
                  className={`w-full text-left px-4 py-2 hover:bg-storm/5 dark:hover:bg-storm/40 ${
                    locale === currentLocale
                      ? 'bg-ocean/10 text-ocean dark:text-sky'
                      : 'text-storm dark:text-foam'
                  }`}
                >
                  {LOCALE_NAMES[locale]}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
