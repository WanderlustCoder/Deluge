/**
 * Blockchain Hashing Utilities
 * Plan 27: Blockchain Transparency Ledger
 *
 * Provides SHA-256 hashing for records and Merkle tree construction.
 * Uses Node.js crypto for server-side and Web Crypto API for client.
 */

import crypto from 'crypto';

/**
 * Generate SHA-256 hash of a string
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate hash of an object by stringifying it deterministically
 */
export function hashObject(obj: Record<string, unknown>): string {
  const normalized = JSON.stringify(sortObjectKeys(obj));
  return sha256(normalized);
}

/**
 * Sort object keys recursively for deterministic stringification
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();

  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }

  return sorted;
}

/**
 * Generate a record hash for a transparency record
 */
export function generateRecordHash(record: {
  recordType: string;
  entityType: string;
  entityId: string;
  amount?: number | null;
  metadata: Record<string, unknown>;
  previousHash?: string | null;
  timestamp: Date;
}): string {
  const data = {
    recordType: record.recordType,
    entityType: record.entityType,
    entityId: record.entityId,
    amount: record.amount ?? null,
    metadata: record.metadata,
    previousHash: record.previousHash ?? null,
    timestamp: record.timestamp.toISOString(),
  };

  return hashObject(data);
}

/**
 * Verify that a record hash matches its content
 */
export function verifyRecordHash(
  record: {
    recordType: string;
    entityType: string;
    entityId: string;
    amount?: number | null;
    metadata: Record<string, unknown>;
    previousHash?: string | null;
    createdAt: Date;
  },
  expectedHash: string
): boolean {
  const computedHash = generateRecordHash({
    ...record,
    timestamp: record.createdAt,
  });
  return computedHash === expectedHash;
}

/**
 * Generate a certificate hash for an impact certificate
 */
export function generateCertificateHash(certificate: {
  userId: string;
  certificateType: string;
  entityType: string;
  entityId: string;
  amount?: number | null;
  impactClaim: string;
  recordHash: string;
  issuedAt: Date;
}): string {
  const data = {
    userId: certificate.userId,
    certificateType: certificate.certificateType,
    entityType: certificate.entityType,
    entityId: certificate.entityId,
    amount: certificate.amount ?? null,
    impactClaim: certificate.impactClaim,
    recordHash: certificate.recordHash,
    issuedAt: certificate.issuedAt.toISOString(),
  };

  return hashObject(data);
}

/**
 * Hash multiple hashes together (for Merkle tree nodes)
 */
export function combineHashes(left: string, right: string): string {
  return sha256(left + right);
}
