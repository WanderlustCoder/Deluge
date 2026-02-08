import { prisma } from '@/lib/prisma';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Default supported currencies
export const DEFAULT_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
];

// Get all active currencies
export async function getActiveCurrencies() {
  const currencies = await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { code: 'asc' }],
  });

  if (currencies.length === 0) {
    // Return defaults if none configured
    return DEFAULT_CURRENCIES;
  }

  return currencies;
}

// Get a single currency by code
export async function getCurrency(code: string) {
  const currency = await prisma.currency.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!currency) {
    // Check defaults
    return DEFAULT_CURRENCIES.find((c) => c.code === code.toUpperCase()) || null;
  }

  return currency;
}

// Get the default currency
export async function getDefaultCurrency(): Promise<CurrencyInfo> {
  const defaultCurrency = await prisma.currency.findFirst({
    where: { isDefault: true, isActive: true },
  });

  if (defaultCurrency) {
    return {
      code: defaultCurrency.code,
      name: defaultCurrency.name,
      symbol: defaultCurrency.symbol,
      decimals: defaultCurrency.decimals,
    };
  }

  // USD is always the fallback default
  return DEFAULT_CURRENCIES[0];
}

// Initialize currencies in database
export async function initializeCurrencies() {
  for (let i = 0; i < DEFAULT_CURRENCIES.length; i++) {
    const currency = DEFAULT_CURRENCIES[i];
    await prisma.currency.upsert({
      where: { code: currency.code },
      create: {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        decimals: currency.decimals,
        isActive: true,
        isDefault: currency.code === 'USD',
        order: i,
      },
      update: {},
    });
  }
}

// Get user's currency preferences
export async function getUserCurrencyPreference(userId: string) {
  const preference = await prisma.userCurrencyPreference.findUnique({
    where: { userId },
  });

  if (!preference) {
    return {
      displayCurrency: 'USD',
      paymentCurrency: 'USD',
      autoConvert: true,
    };
  }

  return preference;
}

// Set user's currency preferences
export async function setUserCurrencyPreference(
  userId: string,
  displayCurrency: string,
  paymentCurrency: string,
  autoConvert: boolean = true
) {
  return prisma.userCurrencyPreference.upsert({
    where: { userId },
    create: {
      userId,
      displayCurrency: displayCurrency.toUpperCase(),
      paymentCurrency: paymentCurrency.toUpperCase(),
      autoConvert,
    },
    update: {
      displayCurrency: displayCurrency.toUpperCase(),
      paymentCurrency: paymentCurrency.toUpperCase(),
      autoConvert,
    },
  });
}

// Validate currency code
export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code.toUpperCase());
}
