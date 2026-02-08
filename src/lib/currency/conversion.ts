import { prisma } from '@/lib/prisma';
import { getExchangeRateWithFallback } from './exchange';

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  rateTimestamp: Date;
}

// Convert amount from one currency to another
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const now = new Date();

  // Same currency, no conversion needed
  if (from === to) {
    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount: amount,
      convertedCurrency: to,
      exchangeRate: 1,
      rateTimestamp: now,
    };
  }

  const rate = await getExchangeRateWithFallback(from, to);
  const convertedAmount = Math.round(amount * rate * 100) / 100;

  return {
    originalAmount: amount,
    originalCurrency: from,
    convertedAmount,
    convertedCurrency: to,
    exchangeRate: rate,
    rateTimestamp: now,
  };
}

// Record a transaction with currency info
export async function recordTransactionCurrency(
  transactionId: string,
  transactionType: string,
  conversion: ConversionResult
) {
  return prisma.transactionCurrency.upsert({
    where: {
      transactionId_transactionType: {
        transactionId,
        transactionType,
      },
    },
    create: {
      transactionId,
      transactionType,
      originalAmount: conversion.originalAmount,
      originalCurrency: conversion.originalCurrency,
      convertedAmount: conversion.convertedAmount,
      convertedCurrency: conversion.convertedCurrency,
      exchangeRate: conversion.exchangeRate,
      rateTimestamp: conversion.rateTimestamp,
    },
    update: {
      originalAmount: conversion.originalAmount,
      originalCurrency: conversion.originalCurrency,
      convertedAmount: conversion.convertedAmount,
      convertedCurrency: conversion.convertedCurrency,
      exchangeRate: conversion.exchangeRate,
      rateTimestamp: conversion.rateTimestamp,
    },
  });
}

// Get currency info for a transaction
export async function getTransactionCurrency(
  transactionId: string,
  transactionType: string
) {
  return prisma.transactionCurrency.findUnique({
    where: {
      transactionId_transactionType: {
        transactionId,
        transactionType,
      },
    },
  });
}

// Convert an amount to user's display currency
export async function convertToUserDisplay(
  amount: number,
  fromCurrency: string,
  userId: string
): Promise<ConversionResult> {
  const preference = await prisma.userCurrencyPreference.findUnique({
    where: { userId },
  });

  const displayCurrency = preference?.displayCurrency || 'USD';

  return convertAmount(amount, fromCurrency, displayCurrency);
}

// Round to currency decimals
export function roundToCurrency(amount: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

// Calculate FX fee (if any)
export function calculateFxFee(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  feePercent: number = 0
): number {
  if (fromCurrency === toCurrency) {
    return 0;
  }
  return roundToCurrency(amount * (feePercent / 100));
}

// Get conversion preview for checkout
export async function getConversionPreview(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fxFeePercent: number = 0
) {
  const conversion = await convertAmount(amount, fromCurrency, toCurrency);
  const fxFee = calculateFxFee(conversion.convertedAmount, fromCurrency, toCurrency, fxFeePercent);
  const totalAmount = conversion.convertedAmount + fxFee;

  return {
    ...conversion,
    fxFee,
    fxFeePercent,
    totalAmount,
  };
}
