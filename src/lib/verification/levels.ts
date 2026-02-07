// Verification level definitions

export type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'audited';

export interface LevelDefinition {
  level: VerificationLevel;
  label: string;
  description: string;
  requirements: string[];
  benefits: string[];
  color: string;
  icon: string;
}

export const VERIFICATION_LEVELS: Record<VerificationLevel, LevelDefinition> = {
  unverified: {
    level: 'unverified',
    label: 'Unverified',
    description: 'Basic project with proposer account only',
    requirements: ['Create account', 'Submit project proposal'],
    benefits: ['Listed on platform', 'Accept community funding'],
    color: 'gray',
    icon: 'circle',
  },
  basic: {
    level: 'basic',
    label: 'Basic Verification',
    description: 'Identity verified with basic documentation',
    requirements: [
      'Verify identity (ID or passport)',
      'Provide contact information',
      'Complete project details',
    ],
    benefits: [
      'Verification badge displayed',
      'Higher visibility in search',
      'Eligible for larger funding goals',
    ],
    color: 'blue',
    icon: 'check',
  },
  verified: {
    level: 'verified',
    label: 'Verified',
    description: 'Organization verified with full documentation',
    requirements: [
      'Basic verification complete',
      'Organization verification (EIN, registration)',
      'Upload supporting documents',
      'Physical address verified',
    ],
    benefits: [
      'Verified badge displayed',
      'Priority in discovery',
      'Eligible for Aquifer Pool funding',
      'Featured project eligibility',
    ],
    color: 'green',
    icon: 'shield-check',
  },
  audited: {
    level: 'audited',
    label: 'Audited',
    description: 'Third-party professional audit completed',
    requirements: [
      'Verified status',
      'Third-party financial audit',
      'Impact verification',
      'Ongoing compliance',
    ],
    benefits: [
      'Audited badge displayed',
      'Premium visibility',
      'Eligible for institutional funding',
      'Grant program access',
    ],
    color: 'gold',
    icon: 'award',
  },
};

export const LEVEL_ORDER: VerificationLevel[] = ['unverified', 'basic', 'verified', 'audited'];

export function getLevelIndex(level: VerificationLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function isLevelHigherOrEqual(current: VerificationLevel, required: VerificationLevel): boolean {
  return getLevelIndex(current) >= getLevelIndex(required);
}

export function getNextLevel(current: VerificationLevel): VerificationLevel | null {
  const index = getLevelIndex(current);
  if (index < LEVEL_ORDER.length - 1) {
    return LEVEL_ORDER[index + 1];
  }
  return null;
}
