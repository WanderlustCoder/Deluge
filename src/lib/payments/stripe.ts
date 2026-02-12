/**
 * Stripe Payment Service
 *
 * Real implementation using Stripe for payments and Stripe Connect for payouts.
 * Requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables.
 *
 * This file is a stub - implementation will be completed when Stripe account is set up.
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

// Stripe SDK - uncomment when ready to implement
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
// });

export class StripePaymentService implements PaymentService {
  readonly isLive = true;
  readonly provider = "stripe" as const;

  constructor() {
    // Validate required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is required for live payment processing"
      );
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn(
        "STRIPE_WEBHOOK_SECRET not set - webhook verification will fail"
      );
    }
  }

  // =========================================================================
  // Money In
  // =========================================================================

  async createPaymentIntent(
    _userId: string,
    _amount: number,
    _method: PaymentMethod
  ): Promise<PaymentIntentResult> {
    // TODO: Implement with Stripe
    //
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Stripe uses cents
    //   currency: 'usd',
    //   metadata: { userId },
    //   payment_method_types: this.getPaymentMethodTypes(method),
    // });
    //
    // return {
    //   clientSecret: paymentIntent.client_secret!,
    //   paymentIntentId: paymentIntent.id,
    //   amount,
    // };

    throw new Error("Stripe payment processing not yet implemented");
  }

  async confirmContribution(
    _paymentIntentId: string
  ): Promise<ContributionResult> {
    // TODO: Implement - this is typically called from webhook handler
    //
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    //
    // if (paymentIntent.status !== 'succeeded') {
    //   return { success: false, ... };
    // }
    //
    // Calculate fees, create contribution record, update watershed

    throw new Error("Stripe payment processing not yet implemented");
  }

  // =========================================================================
  // Money Out
  // =========================================================================

  async createDisbursement(
    _request: DisbursementRequest
  ): Promise<DisbursementResult> {
    // TODO: Implement with Stripe Connect transfers
    //
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(request.amount * 100),
    //   currency: 'usd',
    //   destination: request.recipientId, // Stripe Connect account ID
    //   metadata: {
    //     type: request.type,
    //     referenceId: request.referenceId,
    //   },
    // });
    //
    // return {
    //   success: true,
    //   disbursementId: transfer.id,
    //   amount: request.amount,
    //   status: 'in_transit',
    //   transferId: transfer.id,
    //   estimatedArrival: new Date(transfer.created * 1000 + 3 * 24 * 60 * 60 * 1000),
    // };

    throw new Error("Stripe disbursements not yet implemented");
  }

  // =========================================================================
  // Recipient Onboarding (Stripe Connect Standard)
  // =========================================================================

  async createConnectAccount(
    _request: ConnectAccountRequest
  ): Promise<ConnectAccountResult> {
    // TODO: Implement with Stripe Connect
    //
    // const account = await stripe.accounts.create({
    //   type: 'standard', // Standard accounts have less compliance burden
    //   email: request.email,
    //   metadata: {
    //     userId: request.userId,
    //     recipientType: request.type,
    //   },
    // });
    //
    // return {
    //   success: true,
    //   accountId: account.id,
    //   status: 'pending',
    //   onboardingComplete: false,
    // };

    throw new Error("Stripe Connect not yet implemented");
  }

  async getOnboardingLink(_accountId: string): Promise<OnboardingLinkResult> {
    // TODO: Implement with Stripe Account Links
    //
    // const accountLink = await stripe.accountLinks.create({
    //   account: accountId,
    //   refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/refresh`,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/complete`,
    //   type: 'account_onboarding',
    // });
    //
    // return {
    //   url: accountLink.url,
    //   expiresAt: new Date(accountLink.expires_at * 1000),
    // };

    throw new Error("Stripe Connect not yet implemented");
  }

  async getConnectAccountStatus(
    _accountId: string
  ): Promise<ConnectAccountResult> {
    // TODO: Implement
    //
    // const account = await stripe.accounts.retrieve(accountId);
    //
    // return {
    //   success: true,
    //   accountId: account.id,
    //   status: account.charges_enabled ? 'enabled' : 'pending',
    //   onboardingComplete: account.details_submitted,
    // };

    throw new Error("Stripe Connect not yet implemented");
  }

  // =========================================================================
  // Bank Linking (Plaid)
  // =========================================================================

  async createLinkToken(_userId: string): Promise<LinkTokenResult> {
    // TODO: Implement with Plaid
    //
    // This requires Plaid SDK and credentials
    // const plaidClient = new PlaidApi(configuration);
    //
    // const response = await plaidClient.linkTokenCreate({
    //   user: { client_user_id: userId },
    //   client_name: 'Deluge',
    //   products: ['auth'],
    //   country_codes: ['US'],
    //   language: 'en',
    // });
    //
    // return {
    //   linkToken: response.data.link_token,
    //   expiresAt: new Date(response.data.expiration),
    // };

    throw new Error("Plaid bank linking not yet implemented");
  }

  async exchangePublicToken(
    _publicToken: string,
    _userId: string
  ): Promise<BankAccountResult> {
    // TODO: Implement with Plaid
    //
    // Exchange public token for access token
    // Get account details
    // Create Stripe bank account from Plaid account
    //
    // const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    //   public_token: publicToken,
    // });
    //
    // const authResponse = await plaidClient.authGet({
    //   access_token: exchangeResponse.data.access_token,
    // });
    //
    // Create Stripe bank account token from Plaid account

    throw new Error("Plaid bank linking not yet implemented");
  }

  // =========================================================================
  // Loan Repayments
  // =========================================================================

  async processRepayment(_request: RepaymentRequest): Promise<RepaymentResult> {
    // TODO: Implement
    //
    // For card payments: create PaymentIntent
    // For ACH pull: create charge against saved bank account
    // For ACH push: generate payment instructions for borrower
    //
    // After payment succeeds, distribute to funders' watersheds

    throw new Error("Loan repayment processing not yet implemented");
  }

  async setupAutoPay(_request: AutoPaySetupRequest): Promise<AutoPayResult> {
    // TODO: Implement
    //
    // Create Stripe Subscription or scheduled payment
    // Store auto-pay configuration in database

    throw new Error("Auto-pay setup not yet implemented");
  }

  async cancelAutoPay(_autoPayId: string): Promise<{ success: boolean }> {
    // TODO: Implement
    //
    // Cancel Stripe subscription or scheduled payment

    throw new Error("Auto-pay cancellation not yet implemented");
  }

  // =========================================================================
  // KYC (Stripe Identity)
  // =========================================================================

  async createKycSession(_userId: string): Promise<KycSessionResult> {
    // TODO: Implement with Stripe Identity
    //
    // const verificationSession = await stripe.identity.verificationSessions.create({
    //   type: 'document',
    //   metadata: { userId },
    //   options: {
    //     document: {
    //       require_matching_selfie: true,
    //     },
    //   },
    // });
    //
    // return {
    //   sessionId: verificationSession.id,
    //   url: verificationSession.url!,
    //   expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    // };

    throw new Error("Stripe Identity not yet implemented");
  }

  async getKycStatus(_userId: string): Promise<KycStatusResult> {
    // TODO: Implement
    //
    // Look up user's verification session status

    throw new Error("Stripe Identity not yet implemented");
  }

  // =========================================================================
  // Webhooks
  // =========================================================================

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // TODO: Implement
    //
    // try {
    //   stripe.webhooks.constructEvent(
    //     payload,
    //     signature,
    //     process.env.STRIPE_WEBHOOK_SECRET!
    //   );
    //   return true;
    // } catch {
    //   return false;
    // }

    throw new Error("Webhook verification not yet implemented");
  }

  parseWebhookEvent(_payload: string): WebhookEvent {
    // TODO: Implement
    //
    // const event = stripe.webhooks.constructEvent(
    //   payload,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );
    //
    // return {
    //   id: event.id,
    //   type: event.type as WebhookEventType,
    //   data: event.data.object,
    //   createdAt: new Date(event.created * 1000),
    // };

    throw new Error("Webhook parsing not yet implemented");
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private getPaymentMethodTypes(
    method: PaymentMethod
  ): ("card" | "us_bank_account")[] {
    switch (method) {
      case "card":
      case "apple_pay":
      case "google_pay":
        return ["card"];
      case "ach":
        return ["us_bank_account"];
      default:
        return ["card"];
    }
  }
}

// Export singleton - will throw if env vars not set
// export const stripePaymentService = new StripePaymentService();
