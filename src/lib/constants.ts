// Revenue split — the core business model
export const PLATFORM_CUT_PERCENTAGE = 0.4; // 40% to Deluge
export const WATERSHED_CREDIT_PERCENTAGE = 0.6; // 60% to user's watershed

// Ad values vary by advertiser, market, and format (eCPM-dependent).
// These bounds define the simulated range for the demo.
export const AD_REVENUE_RANGE = { min: 0.008, max: 0.025 }; // gross per view

// Calculate the revenue split for any ad view
export function calculateAdSplit(grossRevenue: number) {
  const platformCut = grossRevenue * PLATFORM_CUT_PERCENTAGE;
  const watershedCredit = grossRevenue * WATERSHED_CREDIT_PERCENTAGE;
  return { grossRevenue, platformCut, watershedCredit };
}

// Generate a simulated ad revenue (random within realistic range)
export function simulateAdRevenue() {
  const gross =
    AD_REVENUE_RANGE.min +
    Math.random() * (AD_REVENUE_RANGE.max - AD_REVENUE_RANGE.min);
  return calculateAdSplit(parseFloat(gross.toFixed(4)));
}

// Limits
export const DAILY_AD_CAP = 30;
export const MIN_FUNDING_AMOUNT = 0.25; // minimum to deploy to a project

// Contributions
export const CASH_WATERSHED_PERCENTAGE = 1.0; // 100% of cash goes to watershed

// Cascade stages — funding progress thresholds
export const CASCADE_STAGES = [
  { name: "Raindrop", threshold: 0, emoji: "💧" },
  { name: "Stream", threshold: 0.1, emoji: "🌊" },
  { name: "Creek", threshold: 0.25, emoji: "🏞️" },
  { name: "River", threshold: 0.5, emoji: "🌊" },
  { name: "Cascade", threshold: 1.0, emoji: "⛰️" },
] as const;

export function getCascadeStage(fundingRaised: number, fundingGoal: number) {
  const progress = fundingGoal > 0 ? fundingRaised / fundingGoal : 0;
  let stage: (typeof CASCADE_STAGES)[number] = CASCADE_STAGES[0];
  for (const s of CASCADE_STAGES) {
    if (progress >= s.threshold) {
      stage = s;
    }
  }
  return { ...stage, progress: Math.min(progress, 1) };
}

// Project categories
export const PROJECT_CATEGORIES = [
  "Education",
  "Environment",
  "Health",
  "Technology",
  "Community",
  "Arts & Culture",
  "Housing",
  "Youth",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

// --- Microloan Constants (Tier 1) ---
export const SHARE_PRICE = 0.25;
export const SERVICING_FEE_RATE = 0.02; // 2% of scheduled payment
export const T1_MAX_AMOUNT = 100;
export const T1_MAX_MONTHS = 6;
export const T1_FUNDING_DEADLINE_DAYS = 7;

export const LOAN_CATEGORIES = [
  "Education",
  "Business",
  "Emergency",
  "Health",
  "Housing",
  "Transportation",
  "Other",
] as const;

export type LoanCategory = (typeof LOAN_CATEGORIES)[number];

// --- Referral Constants ---
export const REFERRAL_SIGNUP_CREDIT = 0.50;
export const REFERRAL_ACTION_CREDIT = 1.00;
export const MONTHLY_REFERRAL_CAP = 10;
export const REFERRAL_ACTION_AD_THRESHOLD = 5;
export const REFERRAL_ACTION_CONTRIBUTION_THRESHOLD = 5;
