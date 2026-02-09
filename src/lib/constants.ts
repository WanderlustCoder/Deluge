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
// completionRate: 0-1 (1 = full view, 0.33 = skipped at 5s of 15s)
export function simulateAdRevenue(completionRate: number = 1) {
  const gross =
    AD_REVENUE_RANGE.min +
    Math.random() * (AD_REVENUE_RANGE.max - AD_REVENUE_RANGE.min);
  const adjusted = gross * completionRate;
  return calculateAdSplit(parseFloat(adjusted.toFixed(4)));
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
  "Energy",
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

// --- Credit Tier System ---
export const CREDIT_TIERS = [
  { tier: 1, maxAmount: 100,  maxMonths: 6,  deadlineDays: 7 },
  { tier: 2, maxAmount: 500,  maxMonths: 12, deadlineDays: 14 },
  { tier: 3, maxAmount: 1000, maxMonths: 18, deadlineDays: 21 },
  { tier: 4, maxAmount: 2000, maxMonths: 24, deadlineDays: 30 },
  { tier: 5, maxAmount: 5000, maxMonths: 24, deadlineDays: 45 },
] as const;

// --- Referral Constants ---
export const REFERRAL_SIGNUP_CREDIT = 0.50;
export const REFERRAL_ACTION_CREDIT = 1.00;
export const MONTHLY_REFERRAL_CAP = 10;
export const REFERRAL_ACTION_AD_THRESHOLD = 5;
export const REFERRAL_ACTION_CONTRIBUTION_THRESHOLD = 5;

// --- Referral Retention Constants ---
export const REFERRAL_RETENTION_CREDIT = 1.00;
export const REFERRAL_RETENTION_DAYS = 30;
export const REFERRAL_RETENTION_MIN_LOGINS = 5;

// --- Ad Category Preferences ---
export const AD_CATEGORIES = [
  "General",
  "Alcohol & Spirits",
  "Tobacco & Vaping",
  "Gambling & Betting",
  "Political & Advocacy",
  "Pharmaceutical",
  "Weight Loss & Body Image",
  "Firearms & Weapons",
  "Dating & Adult",
  "Cryptocurrency & Finance",
] as const;

export type AdCategory = (typeof AD_CATEGORIES)[number];

// --- Aquifer Constants ---
export const AQUIFER_VOTE_DURATION_DAYS = 30;
export const AQUIFER_APPROVAL_THRESHOLD = 0.66; // 66% approval required
export const AQUIFER_REACTIVATION_THRESHOLD = 0.10; // 10% sponsors to reactivate tabled project

// --- Settlement & Reserve Constants ---
export const SETTLEMENT_NET_TERM_DAYS = 30;
export const RESERVE_INITIAL_BALANCE = 5000;
export const RESERVE_HEALTHY_COVERAGE = 1.0;    // 100% = healthy
export const RESERVE_WATCH_COVERAGE = 0.5;       // 50% = watch
export const RESERVE_CRITICAL_COVERAGE = 0.25;   // 25% = critical

// --- Loan Q&A ---
export const LOAN_QA_MAX_QUESTIONS_PER_FUNDER = 2;
export const LOAN_QA_QUESTION_MAX_CHARS = 280;
export const LOAN_QA_FLAG_HIDE_THRESHOLD = 3;

// --- Refinancing ---
export const REFINANCE_MIN_BALANCE = 1000;
export const REFINANCE_FEE_PERCENT = 0.01;
export const REFINANCE_MIN_FEE = 10;

// --- Default Timeline ---
export const DEFAULT_TIMELINE = {
  lateDays: 30,        // 1-30 days = "late"
  atRiskDays: 90,      // 31-90 days = "at risk"
  defaultDays: 90,     // 90+ days = "defaulted"
  recoveryPayments: 3, // 3 consecutive on-time payments to recover
} as const;

// --- Stretch Goals ---
export const STRETCH_GOALS = {
  maxCount: 3,
} as const;

// --- Deadline Extensions ---
export const DEADLINE_EXTENSION = {
  maxExtensions: 2,
  extensionDays: 7,
} as const;

// --- Business Directory ---
export const BUSINESS_VIEW_REVENUE_BASE = 0.002;
export const BUSINESS_ENHANCED_MONTHLY = 20;

// --- Matching Campaigns ---
export const MATCHING_MANAGEMENT_FEE_PERCENT = 0.10; // 10%

// --- Goal Verification ---
export const GOAL_VERIFICATION_FLAG_THRESHOLD = 3;

// --- Community Hierarchy ---
export const COMMUNITY_TYPES = ["geographic", "interest"] as const;
export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export const COMMUNITY_LEVELS = [
  "country",
  "state",
  "county",
  "city",
  "district",
  "neighborhood",
] as const;
export type CommunityLevel = (typeof COMMUNITY_LEVELS)[number];

// Level hierarchy for validation (each level can only have the next level as children)
export const COMMUNITY_LEVEL_HIERARCHY: Record<CommunityLevel, CommunityLevel | null> = {
  country: "state",
  state: "county",
  county: "city",
  city: "district",
  district: "neighborhood",
  neighborhood: null, // No children
};

// --- Community Milestone Thresholds ---
export const COMMUNITY_MILESTONES = {
  funding: [1000, 5000, 10000, 25000, 50000, 100000],
  members: [10, 50, 100, 500, 1000],
  projects: [5, 10, 25, 50, 100],
} as const;

// Milestone type keys
export const MILESTONE_TYPES = {
  funding: (amount: number) => `funding_${amount}`,
  members: (count: number) => `members_${count}`,
  projects: (count: number) => `projects_${count}`,
} as const;

// --- Impact Metric Templates ---
export const IMPACT_METRIC_TEMPLATES: Record<string, Array<{ name: string; unit: string }>> = {
  Education: [
    { name: "Students Served", unit: "students" },
    { name: "Teachers Trained", unit: "teachers" },
    { name: "Books Distributed", unit: "books" },
  ],
  Environment: [
    { name: "Trees Planted", unit: "trees" },
    { name: "Trash Collected", unit: "lbs" },
    { name: "Area Restored", unit: "acres" },
  ],
  Health: [
    { name: "People Served", unit: "people" },
    { name: "Meals Provided", unit: "meals" },
    { name: "Medical Supplies", unit: "kits" },
  ],
  Housing: [
    { name: "Homes Repaired", unit: "homes" },
    { name: "Families Housed", unit: "families" },
  ],
  Technology: [
    { name: "Prototypes Built", unit: "prototypes" },
    { name: "Jobs Created", unit: "jobs" },
  ],
  "Arts & Culture": [
    { name: "Performances", unit: "shows" },
    { name: "Artists Supported", unit: "artists" },
    { name: "Attendees", unit: "people" },
  ],
  Community: [
    { name: "Community Members Impacted", unit: "people" },
    { name: "Events Held", unit: "events" },
  ],
  Youth: [
    { name: "Youth Served", unit: "youth" },
    { name: "Programs Run", unit: "programs" },
  ],
  Energy: [
    { name: "Homes Upgraded", unit: "homes" },
    { name: "kWh Saved Annually", unit: "kWh" },
    { name: "Solar Capacity Installed", unit: "kW" },
    { name: "CO2 Reduced Annually", unit: "tons" },
  ],
} as const;

// --- Watershed Loan Constants ---
export const WATERSHED_LOAN_MIN_BALANCE = 100; // Minimum watershed balance to be eligible
export const WATERSHED_LOAN_MIN_AMOUNT = 100;  // Minimum loan amount (platform-wide)
export const WATERSHED_LOAN_ORIGINATION_FEE_RATE = 0.01; // 1% of community-funded portion
export const WATERSHED_LOAN_TERM_LIMITS = [
  { minAmount: 100,  maxAmount: 500,  maxMonths: 12 },
  { minAmount: 501,  maxAmount: 1000, maxMonths: 18 },
  { minAmount: 1001, maxAmount: 5000, maxMonths: 24 },
  { minAmount: 5001, maxAmount: Infinity, maxMonths: 24 },
] as const;

// Funding deadline days for watershed-backed loans (based on community-funded amount)
export const WATERSHED_LOAN_FUNDING_DEADLINE_DAYS = [
  { maxAmount: 500,  days: 14 },
  { maxAmount: 1000, days: 21 },
  { maxAmount: 5000, days: 30 },
  { maxAmount: Infinity, days: 45 },
] as const;

// --- Home Efficiency Program Constants (Plan 42) ---

export const EFFICIENCY_UPGRADE_CATEGORIES = [
  "insulation",
  "air_sealing",
  "doors",
  "windows",
  "hvac",
  "water_heating",
  "electrical_panel",
  "roof_reinforcement",
  "solar",
] as const;

export type EfficiencyUpgradeCategory = (typeof EFFICIENCY_UPGRADE_CATEGORIES)[number];

export const EFFICIENCY_UPGRADE_LABELS: Record<EfficiencyUpgradeCategory, string> = {
  insulation: "Insulation",
  air_sealing: "Air Sealing",
  doors: "Doors",
  windows: "Windows",
  hvac: "HVAC Systems",
  water_heating: "Water Heating",
  electrical_panel: "Electrical Panel",
  roof_reinforcement: "Roof Reinforcement",
  solar: "Solar Installation",
};

export const EFFICIENCY_PHASES = [
  { phase: 1, name: "envelope",    label: "Envelope",    categories: ["insulation", "air_sealing", "doors"] as const, costMin: 3000,  costMax: 10000 },
  { phase: 2, name: "openings",    label: "Openings",    categories: ["windows"] as const,                           costMin: 5000,  costMax: 15000 },
  { phase: 3, name: "systems",     label: "Systems",     categories: ["hvac", "water_heating"] as const,             costMin: 5000,  costMax: 20000 },
  { phase: 4, name: "electrical",  label: "Electrical",  categories: ["electrical_panel"] as const,                  costMin: 2000,  costMax: 5000  },
  { phase: 5, name: "generation",  label: "Generation",  categories: ["roof_reinforcement", "solar"] as const,       costMin: 15000, costMax: 35000 },
] as const;

export const EFFICIENCY_HOME_TYPES = [
  "single_family",
  "townhouse",
  "duplex",
  "mobile",
  "condo",
] as const;

export type EfficiencyHomeType = (typeof EFFICIENCY_HOME_TYPES)[number];

export const EFFICIENCY_HOME_TYPE_LABELS: Record<EfficiencyHomeType, string> = {
  single_family: "Single Family",
  townhouse: "Townhouse",
  duplex: "Duplex",
  mobile: "Mobile Home",
  condo: "Condo",
};

export const EFFICIENCY_ENTRY_TRACKS = ["individual", "nomination", "cascade"] as const;
export type EfficiencyEntryTrack = (typeof EFFICIENCY_ENTRY_TRACKS)[number];

export const EFFICIENCY_FUNDING_TRACKS = ["fully_funded", "loan_assisted", "co_pay"] as const;
export type EfficiencyFundingTrack = (typeof EFFICIENCY_FUNDING_TRACKS)[number];

export const EFFICIENCY_CASCADE_MIN_HOMES = 10;
export const EFFICIENCY_CASCADE_RADIUS_MILES = 1.0;
export const EFFICIENCY_NOMINATION_VOTE_DURATION_DAYS = 30;
export const EFFICIENCY_NOMINATION_APPROVAL_THRESHOLD = 0.66;
