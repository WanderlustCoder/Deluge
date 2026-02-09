// Number, date, and currency formatting with i18n

import { DEFAULT_LOCALE, Locale } from './config';

// Format number
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

// Format percentage
export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

// Format currency
export function formatCurrency(
  value: number,
  locale: Locale,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format compact number (1K, 1M, etc.)
export function formatCompact(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

// Format date
export function formatDate(
  date: Date | string,
  localeOrStyle?: Locale | 'short' | 'medium' | 'long' | 'full',
  style?: 'short' | 'medium' | 'long' | 'full'
): string {
  // Support both formatDate(date, locale, style) and formatDate(date, style)
  let locale: Locale = DEFAULT_LOCALE;
  let resolvedStyle: 'short' | 'medium' | 'long' | 'full' = 'medium';

  if (localeOrStyle) {
    if (['short', 'medium', 'long', 'full'].includes(localeOrStyle)) {
      resolvedStyle = localeOrStyle as 'short' | 'medium' | 'long' | 'full';
    } else {
      locale = localeOrStyle as Locale;
      if (style) resolvedStyle = style;
    }
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const styleOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };

  return new Intl.DateTimeFormat(locale, styleOptions[resolvedStyle]).format(dateObj);
}

// Format time
export function formatTime(
  date: Date | string,
  locale: Locale,
  showSeconds: boolean = false
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
  }).format(dateObj);
}

// Format date and time
export function formatDateTime(
  date: Date | string,
  localeOrStyle?: Locale | 'short' | 'medium' | 'long',
  dateStyle?: 'short' | 'medium' | 'long'
): string {
  // Support both formatDateTime(date, locale, style) and formatDateTime(date, style)
  let locale: Locale = DEFAULT_LOCALE;
  let resolvedStyle: 'short' | 'medium' | 'long' = 'medium';

  if (localeOrStyle) {
    if (['short', 'medium', 'long'].includes(localeOrStyle)) {
      resolvedStyle = localeOrStyle as 'short' | 'medium' | 'long';
    } else {
      locale = localeOrStyle as Locale;
      if (dateStyle) resolvedStyle = dateStyle;
    }
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: resolvedStyle,
    timeStyle: 'short',
  }).format(dateObj);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffYears) >= 1) {
    return rtf.format(diffYears, 'year');
  }
  if (Math.abs(diffMonths) >= 1) {
    return rtf.format(diffMonths, 'month');
  }
  if (Math.abs(diffWeeks) >= 1) {
    return rtf.format(diffWeeks, 'week');
  }
  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  }
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  }
  if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, 'minute');
  }
  return rtf.format(diffSecs, 'second');
}

// Format list (e.g., "A, B, and C")
export function formatList(items: string[], locale: Locale): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
  }).format(items);
}

// Format ordinal (1st, 2nd, 3rd)
export function formatOrdinal(value: number, locale: Locale): string {
  // Note: Intl.PluralRules can help determine ordinal category
  // but full ordinal formatting requires locale-specific rules
  const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
  const suffixes: Record<string, string> = {
    en: { one: 'st', two: 'nd', few: 'rd', other: 'th' },
    es: { other: '°' },
  }[locale.split('-')[0]] || { other: '' };

  const rule = pr.select(value);
  const suffix = suffixes[rule] || suffixes.other || '';

  return `${value}${suffix}`;
}
