'use client';

import { formatNumber, formatCompact, formatCurrency, formatPercent } from '@/lib/i18n/formatting';
import { Locale } from '@/lib/i18n/config';

interface FormattedNumberProps {
  value: number;
  locale?: Locale;
}

interface FormattedCurrencyProps extends FormattedNumberProps {
  currency?: string;
}

// Format a number according to locale
export function FormattedNumber({ value, locale = 'en' }: FormattedNumberProps) {
  return <>{formatNumber(value, locale)}</>;
}

// Format a compact number (1K, 1M)
export function FormattedCompact({ value, locale = 'en' }: FormattedNumberProps) {
  return <>{formatCompact(value, locale)}</>;
}

// Format currency
export function FormattedCurrency({
  value,
  locale = 'en',
  currency = 'USD',
}: FormattedCurrencyProps) {
  return <>{formatCurrency(value, locale, currency)}</>;
}

// Format percentage
export function FormattedPercent({ value, locale = 'en' }: FormattedNumberProps) {
  return <>{formatPercent(value, locale)}</>;
}
