'use client';

import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
} from '@/lib/i18n/formatting';
import { Locale } from '@/lib/i18n/config';

interface FormattedDateProps {
  date: Date | string;
  locale?: Locale;
  style?: 'short' | 'medium' | 'long' | 'full';
}

interface FormattedTimeProps {
  date: Date | string;
  locale?: Locale;
  showSeconds?: boolean;
}

// Format date according to locale
export function FormattedDate({ date, locale = 'en', style = 'medium' }: FormattedDateProps) {
  return <>{formatDate(date, locale, style)}</>;
}

// Format time
export function FormattedTime({ date, locale = 'en', showSeconds = false }: FormattedTimeProps) {
  return <>{formatTime(date, locale, showSeconds)}</>;
}

// Format date and time
export function FormattedDateTime({
  date,
  locale = 'en',
  style = 'medium',
}: {
  date: Date | string;
  locale?: Locale;
  style?: 'short' | 'medium' | 'long';
}) {
  return <>{formatDateTime(date, locale, style)}</>;
}

// Format relative time (e.g., "2 days ago")
export function FormattedRelativeTime({
  date,
  locale = 'en',
}: {
  date: Date | string;
  locale?: Locale;
}) {
  return <>{formatRelativeTime(date, locale)}</>;
}
