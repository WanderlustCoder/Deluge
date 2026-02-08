// Locale detection utilities

import { DEFAULT_LOCALE, isValidLocale, Locale, SUPPORTED_LOCALES } from './config';

// Detect locale from Accept-Language header
export function detectLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get base language code
        quality: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported locale
  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

// Detect locale from browser navigator
export function detectLocaleFromBrowser(): Locale {
  if (typeof window === 'undefined' || !navigator) {
    return DEFAULT_LOCALE;
  }

  // Try navigator.language first
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  if (browserLang && isValidLocale(browserLang)) {
    return browserLang;
  }

  // Try navigator.languages
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const code = lang.split('-')[0].toLowerCase();
      if (isValidLocale(code)) {
        return code;
      }
    }
  }

  return DEFAULT_LOCALE;
}

// Get locale from URL path
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }

  return null;
}

// Get locale from cookie
export function getLocaleFromCookie(cookies: string | null): Locale | null {
  if (!cookies) return null;

  const match = cookies.match(/locale=([^;]+)/);
  if (match && isValidLocale(match[1])) {
    return match[1] as Locale;
  }

  return null;
}

// Get the best locale based on various sources
export function getBestLocale(options: {
  cookie?: string | null;
  acceptLanguage?: string | null;
  userPreference?: string | null;
  pathname?: string | null;
}): Locale {
  // Priority order:
  // 1. User preference (from database)
  // 2. Cookie
  // 3. URL path
  // 4. Accept-Language header
  // 5. Default

  if (options.userPreference && isValidLocale(options.userPreference)) {
    return options.userPreference;
  }

  const cookieLocale = getLocaleFromCookie(options.cookie || null);
  if (cookieLocale) {
    return cookieLocale;
  }

  if (options.pathname) {
    const pathLocale = getLocaleFromPath(options.pathname);
    if (pathLocale) {
      return pathLocale;
    }
  }

  if (options.acceptLanguage) {
    return detectLocaleFromHeader(options.acceptLanguage);
  }

  return DEFAULT_LOCALE;
}

// Get all supported locales with metadata
export function getSupportedLocales() {
  return SUPPORTED_LOCALES.map((locale) => ({
    code: locale,
    name: getLocaleName(locale),
    direction: getLocaleDirection(locale),
  }));
}

// Helper to import from config
import { getLocaleName, getLocaleDirection } from './config';
