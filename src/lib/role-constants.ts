export const PLATFORM_ROLES = ["verified_giver", "sponsor", "trusted_borrower", "mentor"] as const;
export type PlatformRole = typeof PLATFORM_ROLES[number];

export const ROLE_DISPLAY: Record<PlatformRole, { name: string; icon: string; color: string }> = {
  verified_giver: { name: "Verified Giver", icon: "BadgeCheck", color: "teal" },
  sponsor: { name: "Sponsor", icon: "Shield", color: "gold" },
  trusted_borrower: { name: "Trusted Borrower", icon: "Star", color: "sky" },
  mentor: { name: "Mentor", icon: "GraduationCap", color: "ocean" },
};

export const DEFAULT_ROLE_THRESHOLDS: Record<PlatformRole, Record<string, unknown>> = {
  verified_giver: { minProjectsFunded: 5, minLoansFunded: 5, requireEither: true },
  sponsor: { requiresRole: "verified_giver", minContributionTotal: 50 },
  trusted_borrower: { minCreditTier: 3 },
  mentor: { manual: true },
};
