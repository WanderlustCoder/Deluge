import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "@/__mocks__/prisma";
import "@/__mocks__/auth";

vi.mock("@/lib/currency/exchange", () => ({
  getExchangeRateWithFallback: vi.fn(),
}));

import { getExchangeRateWithFallback } from "@/lib/currency/exchange";
import {
  calculateFxFee,
  convertAmount,
  convertToUserDisplay,
  getConversionPreview,
  recordTransactionCurrency,
  roundToCurrency,
} from "../currency/conversion";

const mockedGetExchangeRateWithFallback = vi.mocked(getExchangeRateWithFallback);

describe("currency conversion helpers", () => {
  beforeEach(() => {
    mockedGetExchangeRateWithFallback.mockReset();
  });

  it("returns unchanged values for same-currency conversion", async () => {
    const result = await convertAmount(10, "usd", "USD");
    expect(result.convertedAmount).toBe(10);
    expect(result.exchangeRate).toBe(1);
    expect(mockedGetExchangeRateWithFallback).not.toHaveBeenCalled();
  });

  it("applies exchange rate and rounds converted amount", async () => {
    mockedGetExchangeRateWithFallback.mockResolvedValue(1.23456);
    const result = await convertAmount(10, "USD", "CAD");
    expect(result.convertedAmount).toBe(12.35);
    expect(result.exchangeRate).toBe(1.23456);
  });

  it("calculates FX fees only when currencies differ", () => {
    expect(calculateFxFee(50, "USD", "USD", 2)).toBe(0);
    expect(calculateFxFee(50, "USD", "CAD", 2)).toBe(1);
  });

  it("builds conversion preview including fee and total", async () => {
    mockedGetExchangeRateWithFallback.mockResolvedValue(2);
    const preview = await getConversionPreview(10, "USD", "CAD", 1.5);
    expect(preview.convertedAmount).toBe(20);
    expect(preview.fxFee).toBe(0.3);
    expect(preview.totalAmount).toBe(20.3);
  });

  it("records transaction currency via upsert", async () => {
    const conversion = {
      originalAmount: 10,
      originalCurrency: "USD",
      convertedAmount: 12.5,
      convertedCurrency: "CAD",
      exchangeRate: 1.25,
      rateTimestamp: new Date("2026-01-01T00:00:00.000Z"),
    };

    prismaMock.transactionCurrency.upsert.mockResolvedValue({} as any);
    await recordTransactionCurrency("tx-1", "contribution", conversion);

    expect(prismaMock.transactionCurrency.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          transactionId_transactionType: {
            transactionId: "tx-1",
            transactionType: "contribution",
          },
        },
        create: expect.objectContaining({ convertedAmount: 12.5 }),
        update: expect.objectContaining({ exchangeRate: 1.25 }),
      })
    );
  });

  it("converts to user's preferred display currency", async () => {
    prismaMock.userCurrencyPreference.findUnique.mockResolvedValue({
      userId: "user-1",
      displayCurrency: "CAD",
      paymentCurrency: "CAD",
      autoConvert: true,
    } as any);
    mockedGetExchangeRateWithFallback.mockResolvedValue(1.3);

    const result = await convertToUserDisplay(10, "USD", "user-1");
    expect(result.convertedCurrency).toBe("CAD");
    expect(result.convertedAmount).toBe(13);
  });

  it("falls back to USD display currency when no preference exists", async () => {
    prismaMock.userCurrencyPreference.findUnique.mockResolvedValue(null);
    const result = await convertToUserDisplay(10, "USD", "user-2");
    expect(result.convertedCurrency).toBe("USD");
    expect(result.exchangeRate).toBe(1);
  });

  it("rounds values to requested currency precision", () => {
    expect(roundToCurrency(1.2345, 2)).toBe(1.23);
    expect(roundToCurrency(1.235, 2)).toBe(1.24);
  });
});
