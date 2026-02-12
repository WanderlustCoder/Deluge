import { getCurrency, DEFAULT_CURRENCIES } from './index';

export interface FormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Format amount with currency symbol
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: FormatOptions = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const code = currencyCode.toUpperCase();

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    if (showCode && !formatted.includes(code)) {
      return `${formatted} ${code}`;
    }

    return formatted;
  } catch {
    // Fallback for unknown currencies
    const currency = DEFAULT_CURRENCIES.find((c) => c.code === code);
    const symbol = currency?.symbol || '$';

    const numberPart = amount.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    if (showSymbol) {
      return `${symbol}${numberPart}${showCode ? ` ${code}` : ''}`;
    }

    return numberPart;
  }
}

// Format for display (async version that looks up currency info)
export async function formatCurrencyAsync(
  amount: number,
  currencyCode: string,
  options: FormatOptions = {}
): Promise<string> {
  const currency = await getCurrency(currencyCode);
  const decimals = currency?.decimals ?? 2;

  return formatCurrency(amount, currencyCode, {
    ...options,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Get locale for a region
export function getLocaleForRegion(regionCode: string): string {
  const localeMap: Record<string, string> = {
    US: 'en-US',
    CA: 'en-CA',
    GB: 'en-GB',
    EU: 'en-IE', // English with Euro formatting
    DE: 'de-DE',
    FR: 'fr-FR',
    ES: 'es-ES',
    IT: 'it-IT',
    AU: 'en-AU',
    NZ: 'en-NZ',
  };

  return localeMap[regionCode.toUpperCase()] || 'en-US';
}

// Format number based on locale
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

// Format exchange rate for display
export function formatExchangeRate(rate: number, precision: number = 4): string {
  return rate.toFixed(precision);
}

// Format percentage
export function formatPercentage(
  value: number,
  locale: string = 'en-US',
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Get symbol for currency
export function getCurrencySymbol(currencyCode: string): string {
  const code = currencyCode.toUpperCase();
  const currency = DEFAULT_CURRENCIES.find((c) => c.code === code);

  if (currency) {
    return currency.symbol;
  }

  // Try Intl API
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
    }).formatToParts(0);

    const symbolPart = parts.find((p) => p.type === 'currency');
    return symbolPart?.value || code;
  } catch {
    return code;
  }
}

// Parse currency string to number
export function parseCurrencyString(value: string): number {
  const cleaned = value.replace(/[^0-9.,\-]/g, '').trim();
  if (!cleaned) return 0;

  const isNegative = cleaned.includes('-');
  const unsigned = cleaned.replace(/-/g, '');
  const lastDot = unsigned.lastIndexOf('.');
  const lastComma = unsigned.lastIndexOf(',');
  const decimalIndex = Math.max(lastDot, lastComma);
  const hasBothSeparators = lastDot >= 0 && lastComma >= 0;
  const separatorCount = (unsigned.match(/[.,]/g) || []).length;

  // No decimal separator: strip separators and parse as integer.
  if (decimalIndex < 0) {
    const integer = unsigned.replace(/[.,]/g, '');
    const parsed = parseFloat(integer);
    return Number.isFinite(parsed) ? (isNegative ? -parsed : parsed) : 0;
  }

  const fractionalRaw = unsigned.slice(decimalIndex + 1);

  // One separator with three trailing digits is usually thousands grouping, not decimals.
  if (!hasBothSeparators && separatorCount === 1 && fractionalRaw.length === 3) {
    const integer = unsigned.replace(/[.,]/g, '');
    const parsed = parseFloat(integer);
    return Number.isFinite(parsed) ? (isNegative ? -parsed : parsed) : 0;
  }

  // Use the final separator as decimal; treat earlier separators as grouping.
  const integerPart = unsigned.slice(0, decimalIndex).replace(/[.,]/g, '');
  const fractionalPart = fractionalRaw.replace(/[.,]/g, '');
  const normalized = `${integerPart}.${fractionalPart}`;
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? (isNegative ? -parsed : parsed) : 0;
}

// Format compact currency (e.g., $1.5K, $2.3M)
export function formatCompactCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string {
  const code = currencyCode.toUpperCase();

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(code);
    const formatted = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);

    return `${symbol}${formatted}`;
  }
}
