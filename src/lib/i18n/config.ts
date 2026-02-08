// i18n configuration

export const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LOCALES = ['en', 'es', 'zh', 'vi', 'tl', 'ko', 'ar'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  vi: 'Tiếng Việt',
  tl: 'Tagalog',
  ko: '한국어',
  ar: 'العربية',
};

export const LOCALE_DIRECTIONS: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  zh: 'ltr',
  vi: 'ltr',
  tl: 'ltr',
  ko: 'ltr',
  ar: 'rtl',
};

export const TRANSLATION_NAMESPACES = [
  'common',
  'auth',
  'projects',
  'communities',
  'loans',
  'account',
  'admin',
  'errors',
] as const;

export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[number];

// Check if locale is supported
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

// Get locale direction
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_DIRECTIONS[locale] || 'ltr';
}

// Get locale display name
export function getLocaleName(locale: Locale): string {
  return LOCALE_NAMES[locale] || locale;
}
