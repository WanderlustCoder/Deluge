// Verification check types and requirements

export type CheckType = 'identity' | 'documents' | 'location' | 'organization' | 'outcome';
export type CheckStatus = 'pending' | 'passed' | 'failed' | 'expired';

export interface CheckDefinition {
  type: CheckType;
  label: string;
  description: string;
  requiredFor: ('basic' | 'verified' | 'audited')[];
  expirationDays: number | null;
  evidenceRequired: string[];
}

export const CHECK_DEFINITIONS: Record<CheckType, CheckDefinition> = {
  identity: {
    type: 'identity',
    label: 'Identity Verification',
    description: 'Verify the identity of the project proposer',
    requiredFor: ['basic', 'verified', 'audited'],
    expirationDays: 365, // Re-verify annually
    evidenceRequired: ['government_id', 'selfie'],
  },
  documents: {
    type: 'documents',
    label: 'Document Verification',
    description: 'Verify project-related documents and materials',
    requiredFor: ['basic', 'verified', 'audited'],
    expirationDays: null, // Per-project, doesn't expire
    evidenceRequired: ['project_plan', 'budget_breakdown'],
  },
  location: {
    type: 'location',
    label: 'Location Verification',
    description: 'Verify the physical location or service area',
    requiredFor: ['verified', 'audited'],
    expirationDays: 365,
    evidenceRequired: ['address_proof', 'utility_bill'],
  },
  organization: {
    type: 'organization',
    label: 'Organization Verification',
    description: 'Verify nonprofit or organization status',
    requiredFor: ['verified', 'audited'],
    expirationDays: 365,
    evidenceRequired: ['ein_letter', 'registration_certificate', 'articles_of_incorporation'],
  },
  outcome: {
    type: 'outcome',
    label: 'Outcome Verification',
    description: 'Verify project outcomes and impact',
    requiredFor: ['audited'],
    expirationDays: null, // Project-specific
    evidenceRequired: ['completion_photos', 'receipts', 'beneficiary_statements'],
  },
};

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  pending: 'Pending Review',
  passed: 'Verified',
  failed: 'Failed',
  expired: 'Expired',
};

export const CHECK_STATUS_COLORS: Record<CheckStatus, string> = {
  pending: 'yellow',
  passed: 'green',
  failed: 'red',
  expired: 'gray',
};

export function getRequiredChecksForLevel(level: 'basic' | 'verified' | 'audited'): CheckType[] {
  return Object.values(CHECK_DEFINITIONS)
    .filter((def) => def.requiredFor.includes(level))
    .map((def) => def.type);
}

export function isCheckExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}
