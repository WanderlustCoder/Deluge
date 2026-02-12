/**
 * Mock Payment Service
 *
 * Fake implementation for development and demo mode.
 * All operations succeed and update the database, but no real money moves.
 */

import type {
  PaymentService,
  PaymentMethod,
  PaymentIntentResult,
  ContributionResult,
  DisbursementRequest,
  DisbursementResult,
  ConnectAccountRequest,
  ConnectAccountResult,
  OnboardingLinkResult,
  LinkTokenResult,
  BankAccountResult,
  RepaymentRequest,
  RepaymentResult,
  AutoPaySetupRequest,
  AutoPayResult,
  KycSessionResult,
  KycStatusResult,
  WebhookEvent,
} from "./types";

function generateId(prefix: string): string {
  return `${prefix}_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export class MockPaymentService implements PaymentService {
  readonly isLive = false;
  readonly provider = "mock" as const;

  // =========================================================================
  // Money In
  // =========================================================================

  async createPaymentIntent(
    _userId: string,
    amount: number,
    _method: PaymentMethod
  ): Promise<PaymentIntentResult> {
    // Simulate payment intent creation
    const paymentIntentId = generateId("pi");

    // In mock mode, we don't actually create anything in Stripe
    // The client secret is fake but follows the format
    const clientSecret = `${paymentIntentId}_secret_mock`;

    return {
      clientSecret,
      paymentIntentId,
      amount,
    };
  }

  async confirmContribution(
    paymentIntentId: string
  ): Promise<ContributionResult> {
    // In mock mode, all payments succeed
    // We need to extract the user from context or pass it differently
    // For now, return success

    const contributionId = generateId("cont");
    const amount = 25.0; // Would come from stored payment intent

    // Simulate processing fee (Stripe charges ~2.9% + $0.30)
    const fee = amount * 0.029 + 0.3;
    const netAmount = amount - fee;

    return {
      success: true,
      contributionId,
      amount,
      fee,
      netAmount,
      status: "succeeded",
      paymentIntentId,
    };
  }

  // =========================================================================
  // Money Out
  // =========================================================================

  async createDisbursement(
    request: DisbursementRequest
  ): Promise<DisbursementResult> {
    const disbursementId = generateId("disb");
    const transferId = generateId("tr");

    // In mock mode, disbursements always succeed after a short delay
    return {
      success: true,
      disbursementId,
      amount: request.amount,
      status: "in_transit",
      transferId,
      estimatedArrival: addDays(new Date(), 3), // ACH typically 2-3 business days
    };
  }

  // =========================================================================
  // Recipient Onboarding
  // =========================================================================

  async createConnectAccount(
    _request: ConnectAccountRequest
  ): Promise<ConnectAccountResult> {
    const accountId = generateId("acct");

    return {
      success: true,
      accountId,
      status: "pending",
      onboardingComplete: false,
    };
  }

  async getOnboardingLink(accountId: string): Promise<OnboardingLinkResult> {
    // In mock mode, return a fake onboarding URL
    // In real implementation, this would be a Stripe Connect onboarding link
    return {
      url: `https://connect.stripe.com/mock/onboarding/${accountId}`,
      expiresAt: addDays(new Date(), 1),
    };
  }

  async getConnectAccountStatus(
    accountId: string
  ): Promise<ConnectAccountResult> {
    // In mock mode, accounts are always enabled after "onboarding"
    return {
      success: true,
      accountId,
      status: "enabled",
      onboardingComplete: true,
    };
  }

  // =========================================================================
  // Bank Linking
  // =========================================================================

  async createLinkToken(_userId: string): Promise<LinkTokenResult> {
    return {
      linkToken: generateId("link-token"),
      expiresAt: addDays(new Date(), 1),
    };
  }

  async exchangePublicToken(
    _publicToken: string,
    _userId: string
  ): Promise<BankAccountResult> {
    // In mock mode, bank linking always succeeds
    return {
      success: true,
      bankAccountId: generateId("ba"),
      institutionName: "Mock Bank",
      accountMask: "1234",
      accountType: "checking",
      verified: true,
    };
  }

  // =========================================================================
  // Loan Repayments
  // =========================================================================

  async processRepayment(request: RepaymentRequest): Promise<RepaymentResult> {
    const repaymentId = generateId("rep");

    // Calculate principal and fee portions
    // Fee is 2% of scheduled payment amount
    const feePortion = request.amount * 0.02;
    const principalPortion = request.amount - feePortion;

    return {
      success: true,
      repaymentId,
      amount: request.amount,
      principalPortion,
      feePortion,
      status: "succeeded",
      paymentId: generateId("py"),
    };
  }

  async setupAutoPay(request: AutoPaySetupRequest): Promise<AutoPayResult> {
    const autoPayId = generateId("ap");

    // Calculate next payment date
    const now = new Date();
    let nextPaymentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      request.dayOfMonth
    );

    // If we've passed this month's date, go to next month
    if (nextPaymentDate <= now) {
      nextPaymentDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        request.dayOfMonth
      );
    }

    return {
      success: true,
      autoPayId,
      nextPaymentDate,
      amount: 0, // Would be calculated from loan schedule
    };
  }

  async cancelAutoPay(_autoPayId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  // =========================================================================
  // KYC
  // =========================================================================

  async createKycSession(_userId: string): Promise<KycSessionResult> {
    const sessionId = generateId("vs");

    return {
      sessionId,
      url: `https://verify.stripe.com/mock/${sessionId}`,
      expiresAt: addDays(new Date(), 1),
    };
  }

  async getKycStatus(_userId: string): Promise<KycStatusResult> {
    // In mock mode, everyone is verified
    return {
      status: "verified",
      verifiedAt: new Date(),
    };
  }

  // =========================================================================
  // Webhooks
  // =========================================================================

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // In mock mode, all signatures are valid
    return true;
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    // Parse the payload as JSON
    const data = JSON.parse(payload);
    return {
      id: data.id || generateId("evt"),
      type: data.type || "payment_intent.succeeded",
      data: data.data || {},
      createdAt: new Date(data.created * 1000) || new Date(),
    };
  }
}

// Export singleton instance
export const mockPaymentService = new MockPaymentService();
