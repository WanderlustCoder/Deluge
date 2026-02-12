import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatPercentage,
  getCurrencySymbol,
  getLocaleForRegion,
  parseCurrencyString,
} from "../currency/format";

describe("currency formatting helpers", () => {
  it("formats USD amounts with symbol and decimals", () => {
    expect(formatCurrency(1234.5, "usd")).toBe("$1,234.50");
  });

  it("appends currency code when showCode is enabled", () => {
    expect(formatCurrency(10, "usd", { showCode: true })).toContain("USD");
  });

  it("maps region codes to locales with fallback", () => {
    expect(getLocaleForRegion("DE")).toBe("de-DE");
    expect(getLocaleForRegion("unknown")).toBe("en-US");
  });

  it("formats percentages using numeric percent input", () => {
    expect(formatPercentage(12.5)).toBe("12.50%");
  });

  it("parses currency strings with US and EU separators", () => {
    expect(parseCurrencyString("$1,234.56")).toBe(1234.56);
    expect(parseCurrencyString("EUR 1.234,56")).toBe(1234.56);
    expect(parseCurrencyString("-£2,500")).toBe(-2500);
  });

  it("returns symbols for known currencies", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });
});
