import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

async function loadPaymentsModule() {
  return import("../payments");
}

describe("payments module", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.PAYMENT_MODE;
    delete process.env.STRIPE_SECRET_KEY;
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  it("defaults to mock provider when no payment env vars are set", async () => {
    const payments = await loadPaymentsModule();
    expect(payments.getPaymentProvider()).toBe("mock");
    expect(payments.isLivePayments()).toBe(false);
    expect(payments.paymentService.provider).toBe("mock");
  });

  it("forces mock provider when PAYMENT_MODE=mock", async () => {
    process.env.PAYMENT_MODE = "mock";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";

    const payments = await loadPaymentsModule();
    expect(payments.getPaymentProvider()).toBe("mock");
    expect(payments.isLivePayments()).toBe(false);
  });

  it("falls back to mock while Stripe implementation is not enabled", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_456";

    const payments = await loadPaymentsModule();
    expect(payments.getPaymentProvider()).toBe("mock");
    expect(payments.isLivePayments()).toBe(false);
  });
});
