'use client';

import { formatCurrency, formatCompactCurrency, getCurrencySymbol } from '@/lib/currency/format';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  compact?: boolean;
  className?: string;
  locale?: string;
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  showSymbol = true,
  showCode = false,
  compact = false,
  className = '',
  locale = 'en-US',
}: CurrencyDisplayProps) {
  const formatted = compact
    ? formatCompactCurrency(amount, currency, locale)
    : formatCurrency(amount, currency, { showSymbol, showCode, locale });

  return <span className={className}>{formatted}</span>;
}

interface CurrencyAmountProps {
  amount: number;
  originalCurrency: string;
  displayCurrency?: string;
  exchangeRate?: number;
  showOriginal?: boolean;
  className?: string;
}

export function CurrencyAmount({
  amount,
  originalCurrency,
  displayCurrency,
  exchangeRate,
  showOriginal = false,
  className = '',
}: CurrencyAmountProps) {
  const displayCurr = displayCurrency || originalCurrency;
  const convertedAmount = exchangeRate ? amount * exchangeRate : amount;

  return (
    <span className={className}>
      <CurrencyDisplay amount={convertedAmount} currency={displayCurr} />
      {showOriginal && displayCurrency && displayCurrency !== originalCurrency && (
        <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
          ({getCurrencySymbol(originalCurrency)}
          {amount.toFixed(2)} {originalCurrency})
        </span>
      )}
    </span>
  );
}

interface ConversionPreviewProps {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  fxFee?: number;
  className?: string;
}

export function ConversionPreview({
  originalAmount,
  originalCurrency,
  convertedAmount,
  convertedCurrency,
  exchangeRate,
  fxFee,
  className = '',
}: ConversionPreviewProps) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 dark:text-gray-400">Amount</span>
        <CurrencyDisplay amount={originalAmount} currency={originalCurrency} />
      </div>
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-gray-500 dark:text-gray-500">
          Exchange Rate (1 {originalCurrency} = )
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          {exchangeRate.toFixed(4)} {convertedCurrency}
        </span>
      </div>
      {fxFee !== undefined && fxFee > 0 && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-500 dark:text-gray-500">FX Fee</span>
          <CurrencyDisplay
            amount={fxFee}
            currency={convertedCurrency}
            className="text-gray-700 dark:text-gray-300"
          />
        </div>
      )}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        <div className="flex justify-between items-center font-medium">
          <span className="text-gray-900 dark:text-white">You Pay</span>
          <CurrencyDisplay
            amount={convertedAmount + (fxFee || 0)}
            currency={convertedCurrency}
            className="text-gray-900 dark:text-white text-lg"
          />
        </div>
      </div>
    </div>
  );
}
