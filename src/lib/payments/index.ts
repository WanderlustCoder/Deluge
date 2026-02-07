/**
 * Payment Service
 *
 * Exports the appropriate payment service based on environment configuration.
 *
 * In development/demo mode: Uses mock implementation (no real money moves)
 * In production with Stripe: Uses real Stripe implementation
 *
 * Usage:
 *   import { paymentService } from '@/lib/payments';
 *   const result = await paymentService.createPaymentIntent(userId, 25.00, 'card');
 */

import type { PaymentService } from "./types";
import { MockPaymentService } from "./mock";
// import { StripePaymentService } from './stripe';

// Re-export types for convenience
export * from "./types";

/**
 * Determines which payment service to use based on environment.
 *
 * Priority:
 * 1. If PAYMENT_MODE=mock, always use mock (for testing in production)
 * 2. If STRIPE_SECRET_KEY is set, use Stripe
 * 3. Otherwise, use mock
 */
function createPaymentService(): PaymentService {
  const paymentMode = process.env.PAYMENT_MODE;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Force mock mode if explicitly set
  if (paymentMode === "mock") {
    console.log("[Payments] Using mock payment service (PAYMENT_MODE=mock)");
    return new MockPaymentService();
  }

  // Use Stripe if credentials are available
  if (stripeKey) {
    console.log("[Payments] Stripe credentials found, but implementation pending");
    console.log("[Payments] Falling back to mock payment service");
    // TODO: Enable when Stripe implementation is complete
    // return new StripePaymentService();
    return new MockPaymentService();
  }

  // Default to mock
  console.log("[Payments] Using mock payment service (no Stripe credentials)");
  return new MockPaymentService();
}

// Export singleton instance
export const paymentService = createPaymentService();

// Export for testing/direct instantiation
export { MockPaymentService } from "./mock";
// export { StripePaymentService } from './stripe';

/**
 * Helper: Check if we're in live payment mode
 */
export function isLivePayments(): boolean {
  return paymentService.isLive;
}

/**
 * Helper: Get payment provider name
 */
export function getPaymentProvider(): "mock" | "stripe" {
  return paymentService.provider;
}
