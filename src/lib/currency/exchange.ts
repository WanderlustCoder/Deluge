import { prisma } from '@/lib/prisma';

export interface ExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  validFrom: Date;
  validUntil?: Date;
}

// Get current exchange rate between two currencies
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // Same currency = 1:1
  if (from === to) {
    return 1;
  }

  const now = new Date();

  // Find the most recent valid rate
  const rate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency: from,
      toCurrency: to,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    orderBy: { validFrom: 'desc' },
  });

  if (rate) {
    return rate.rate;
  }

  // Try inverse rate
  const inverseRate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency: to,
      toCurrency: from,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    orderBy: { validFrom: 'desc' },
  });

  if (inverseRate && inverseRate.rate !== 0) {
    return 1 / inverseRate.rate;
  }

  return null;
}

// Save a new exchange rate
export async function saveExchangeRate(data: ExchangeRateData) {
  const from = data.fromCurrency.toUpperCase();
  const to = data.toCurrency.toUpperCase();

  // Expire previous rates
  await prisma.exchangeRate.updateMany({
    where: {
      fromCurrency: from,
      toCurrency: to,
      validUntil: null,
    },
    data: {
      validUntil: data.validFrom,
    },
  });

  // Create new rate
  return prisma.exchangeRate.create({
    data: {
      fromCurrency: from,
      toCurrency: to,
      rate: data.rate,
      source: data.source,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
    },
  });
}

// Batch update exchange rates (from API provider)
export async function updateExchangeRates(
  baseCurrency: string,
  rates: Record<string, number>,
  source: string
) {
  const base = baseCurrency.toUpperCase();
  const now = new Date();

  const updates = Object.entries(rates).map(([currency, rate]) =>
    saveExchangeRate({
      fromCurrency: base,
      toCurrency: currency.toUpperCase(),
      rate,
      source,
      validFrom: now,
    })
  );

  await Promise.all(updates);
}

// Get rate history for a currency pair
export async function getExchangeRateHistory(
  fromCurrency: string,
  toCurrency: string,
  days: number = 30
): Promise<Array<{ date: Date; rate: number }>> {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rates = await prisma.exchangeRate.findMany({
    where: {
      fromCurrency: from,
      toCurrency: to,
      validFrom: { gte: since },
    },
    orderBy: { validFrom: 'asc' },
    select: {
      validFrom: true,
      rate: true,
    },
  });

  return rates.map((r) => ({
    date: r.validFrom,
    rate: r.rate,
  }));
}

// Get all current rates for a base currency
export async function getAllRatesForCurrency(baseCurrency: string) {
  const base = baseCurrency.toUpperCase();
  const now = new Date();

  const rates = await prisma.exchangeRate.findMany({
    where: {
      fromCurrency: base,
      validFrom: { lte: now },
      OR: [{ validUntil: null }, { validUntil: { gt: now } }],
    },
    orderBy: [{ toCurrency: 'asc' }, { validFrom: 'desc' }],
    distinct: ['toCurrency'],
  });

  const rateMap: Record<string, number> = {};
  rates.forEach((r) => {
    rateMap[r.toCurrency] = r.rate;
  });

  return rateMap;
}

// Fallback rates when no API is available
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  CAD: 1.35,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.53,
  NZD: 1.64,
};

// Get rate with fallback
export async function getExchangeRateWithFallback(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);

  if (rate !== null) {
    return rate;
  }

  // Use fallback rates via USD
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  const fromToUsd = FALLBACK_RATES[from] || 1;
  const toToUsd = FALLBACK_RATES[to] || 1;

  // Convert: from -> USD -> to
  return toToUsd / fromToUsd;
}
