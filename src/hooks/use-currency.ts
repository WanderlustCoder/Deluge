'use client';

import { useState, useEffect, useCallback } from 'react';

interface CurrencyPreference {
  displayCurrency: string;
  paymentCurrency: string;
  autoConvert: boolean;
}

interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
}

export function useCurrency() {
  const [preference, setPreference] = useState<CurrencyPreference>({
    displayCurrency: 'USD',
    paymentCurrency: 'USD',
    autoConvert: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const res = await fetch('/api/currency/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreference(data);
      }
    } catch (error) {
      console.error('Error fetching currency preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  const updatePreferences = useCallback(async (updates: Partial<CurrencyPreference>) => {
    try {
      const res = await fetch('/api/currency/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setPreference(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating currency preferences:', error);
      return false;
    }
  }, []);

  const convert = useCallback(
    async (amount: number, from: string, to?: string): Promise<ConversionResult | null> => {
      const targetCurrency = to || preference.displayCurrency;

      try {
        const res = await fetch(
          `/api/currency/convert?amount=${amount}&from=${from}&to=${targetCurrency}`
        );

        if (res.ok) {
          return await res.json();
        }
        return null;
      } catch (error) {
        console.error('Error converting currency:', error);
        return null;
      }
    },
    [preference.displayCurrency]
  );

  const getExchangeRate = useCallback(async (from: string, to: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/currency/rates?base=${from}&target=${to}`);

      if (res.ok) {
        const data = await res.json();
        return data.rate;
      }
      return null;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return null;
    }
  }, []);

  return {
    preference,
    loading,
    updatePreferences,
    convert,
    getExchangeRate,
    displayCurrency: preference.displayCurrency,
    paymentCurrency: preference.paymentCurrency,
  };
}

export function useRegion() {
  const [region, setRegion] = useState<{
    regionCode: string;
    detected: boolean;
    confirmed: boolean;
    regionInfo?: {
      code: string;
      name: string;
      currency: string;
      timezone: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegion();
  }, []);

  async function fetchRegion() {
    try {
      const res = await fetch('/api/regions/user');
      if (res.ok) {
        const data = await res.json();
        setRegion(data);
      }
    } catch (error) {
      console.error('Error fetching region:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateRegion = useCallback(async (regionCode: string, confirm: boolean = false) => {
    try {
      const res = await fetch('/api/regions/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionCode, confirm }),
      });

      if (res.ok) {
        await fetchRegion();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating region:', error);
      return false;
    }
  }, []);

  const detectRegion = useCallback(async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch('/api/regions/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      });

      if (res.ok) {
        const data = await res.json();
        setRegion({
          regionCode: data.detected.regionCode,
          detected: true,
          confirmed: false,
          regionInfo: data.regionInfo,
        });
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error detecting region:', error);
      return null;
    }
  }, []);

  return {
    region,
    loading,
    updateRegion,
    detectRegion,
  };
}
