'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrencySymbol } from '@/lib/currency/format';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencySelectorProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  label,
  disabled = false,
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  async function fetchCurrencies() {
    try {
      const res = await fetch('/api/currency');
      if (res.ok) {
        const data = await res.json();
        setCurrencies(data.currencies);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedCurrency = currencies.find((c) => c.code === value);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700 rounded-lg
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-ocean cursor-pointer'}
        `}
      >
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="font-medium">{selectedCurrency?.symbol || '$'}</span>
            <span className="text-gray-900 dark:text-white">
              {selectedCurrency?.code || value}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {selectedCurrency?.name}
            </span>
          </span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {currencies.map((currency) => (
              <button
                key={currency.code}
                type="button"
                onClick={() => {
                  onChange(currency.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left flex items-center gap-3
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  ${currency.code === value ? 'bg-ocean/10' : ''}
                `}
              >
                <span className="font-medium w-8">{currency.symbol}</span>
                <span className="text-gray-900 dark:text-white">{currency.code}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm flex-1">
                  {currency.name}
                </span>
                {currency.code === value && (
                  <svg className="w-5 h-5 text-ocean" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
