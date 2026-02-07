/**
 * Payment Service Types
 *
 * These types define the interface for all payment operations in Deluge.
 * The actual implementation can be mock (for dev/demo) or real (Stripe).
 */

// =============================================================================
// Money In: Contributions
// =============================================================================

export type PaymentMethod = "card" | "ach" | "apple_pay" | "google_pay";

export interface ContributionRequest {
  userId: string;
  amount: number; // in dollars
  method: PaymentMethod;
  idempotencyKey?: string;
}

export interface ContributionResult {
  success: boolean;
  contributionId: string;
  amount: number;
  fee: number; // payment processor fee (absorbed by Deluge, not user)
  netAmount: number; // amount credited to watershed
  status: "pending" | "succeeded" | "failed";
  paymentIntentId?: string; // Stripe PaymentIntent ID
  error?: string;
}

// For card payments, we need a client secret to complete on frontend
export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

// =============================================================================
// Money Out: Disbursements
// =============================================================================

export type DisbursementType = "project" | "loan";

export interface DisbursementRequest {
  type: DisbursementType;
  referenceId: string; // projectId or loanId
  recipientId: string; // connected account ID or user ID
  amount: number;
  description: string;
  metadata?: Record<string, string>;
}

export interface DisbursementResult {
  success: boolean;
  disbursementId: string;
  amount: number;
  status: "pending" | "in_transit" | "succeeded" | "failed";
  transferId?: string; // Stripe Transfer ID
  estimatedArrival?: Date;
  error?: string;
}

// =============================================================================
// Recipient Onboarding (Stripe Connect)
// =============================================================================

export type RecipientType = "individual" | "nonprofit" | "business";

export interface ConnectAccountRequest {
  userId: string;
  email: string;
  type: RecipientType;
  metadata?: Record<string, string>;
}

export interface ConnectAccountResult {
  success: boolean;
  accountId: string; // Stripe Connect account ID
  status: "pending" | "enabled" | "restricted" | "rejected";
  onboardingComplete: boolean;
  error?: string;
}

export interface OnboardingLinkResult {
  url: string;
  expiresAt: Date;
}

// =============================================================================
// Bank Account Linking (Plaid)
// =============================================================================

export interface LinkTokenResult {
  linkToken: string;
  expiresAt: Date;
}

export interface BankAccountResult {
  success: boolean;
  bankAccountId: string;
  institutionName: string;
  accountMask: string; // last 4 digits
  accountType: "checking" | "savings";
  verified: boolean;
  error?: string;
}

// =============================================================================
// Loan Repayments
// =============================================================================

export type RepaymentMethod = "card" | "ach_push" | "ach_pull";

export interface RepaymentRequest {
  loanId: string;
  borrowerId: string;
  amount: number;
  method: RepaymentMethod;
  isScheduled: boolean; // true if this is an auto-pay
}

export interface RepaymentResult {
  success: boolean;
  repaymentId: string;
  amount: number;
  principalPortion: number;
  feePortion: number;
  status: "pending" | "succeeded" | "failed";
  paymentId?: string;
  error?: string;
}

export interface AutoPaySetupRequest {
  loanId: string;
  borrowerId: string;
  bankAccountId: string;
  dayOfMonth: number; // 1-28 (avoid month-end issues)
}

export interface AutoPayResult {
  success: boolean;
  autoPayId: string;
  nextPaymentDate: Date;
  amount: number;
  error?: string;
}

// =============================================================================
// KYC / Identity Verification
// =============================================================================

export type KycStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "failed"
  | "requires_input";

export interface KycSessionResult {
  sessionId: string;
  url: string; // redirect URL for identity verification
  expiresAt: Date;
}

export interface KycStatusResult {
  status: KycStatus;
  verifiedAt?: Date;
  failureReason?: string;
}

// =============================================================================
// Webhooks
// =============================================================================

export type WebhookEventType =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "transfer.created"
  | "transfer.reversed"
  | "account.updated"
  | "identity.verification_session.verified"
  | "identity.verification_session.requires_input";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, unknown>;
  createdAt: Date;
}

// =============================================================================
// Service Interface
// =============================================================================

export interface PaymentService {
  // Service info
  readonly isLive: boolean;
  readonly provider: "mock" | "stripe";

  // Money In
  createPaymentIntent(
    userId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<PaymentIntentResult>;
  confirmContribution(paymentIntentId: string): Promise<ContributionResult>;

  // Money Out
  createDisbursement(request: DisbursementRequest): Promise<DisbursementResult>;

  // Recipient Onboarding
  createConnectAccount(
    request: ConnectAccountRequest
  ): Promise<ConnectAccountResult>;
  getOnboardingLink(accountId: string): Promise<OnboardingLinkResult>;
  getConnectAccountStatus(accountId: string): Promise<ConnectAccountResult>;

  // Bank Linking
  createLinkToken(userId: string): Promise<LinkTokenResult>;
  exchangePublicToken(
    publicToken: string,
    userId: string
  ): Promise<BankAccountResult>;

  // Loan Repayments
  processRepayment(request: RepaymentRequest): Promise<RepaymentResult>;
  setupAutoPay(request: AutoPaySetupRequest): Promise<AutoPayResult>;
  cancelAutoPay(autoPayId: string): Promise<{ success: boolean }>;

  // KYC
  createKycSession(userId: string): Promise<KycSessionResult>;
  getKycStatus(userId: string): Promise<KycStatusResult>;

  // Webhooks
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: string): WebhookEvent;
}
