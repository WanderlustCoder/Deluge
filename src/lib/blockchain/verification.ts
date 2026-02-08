/**
 * Transparency Verification System
 * Plan 27: Blockchain Transparency Ledger
 *
 * Generate and verify cryptographic proofs for transparency records.
 */

import { prisma } from '@/lib/prisma';
import { generateMerkleProof, verifyMerkleProof, getMerkleRoot, type MerkleProof } from './merkle';
import { verifyRecordHash } from './hashing';
import { getExplorerUrl, type ChainId } from './chains';

export interface VerificationResult {
  isValid: boolean;
  recordExists: boolean;
  hashMatches: boolean;
  merkleProofValid: boolean;
  isAnchored: boolean;
  anchorDetails?: {
    chain: string;
    txHash: string;
    anchoredAt: Date;
    explorerUrl: string;
  };
  errors: string[];
}

/**
 * Verify a transparency record by its hash
 */
export async function verifyRecord(hash: string): Promise<VerificationResult> {
  const errors: string[] = [];
  let recordExists = false;
  let hashMatches = false;
  let merkleProofValid = false;
  let isAnchored = false;
  let anchorDetails: VerificationResult['anchorDetails'];

  // Find the record
  const record = await prisma.transparencyRecord.findUnique({
    where: { hash },
  });

  if (!record) {
    return {
      isValid: false,
      recordExists: false,
      hashMatches: false,
      merkleProofValid: false,
      isAnchored: false,
      errors: ['Record not found'],
    };
  }

  recordExists = true;

  // Verify the hash matches the record content
  const metadata = JSON.parse(record.metadata || '{}');
  hashMatches = verifyRecordHash(
    {
      recordType: record.recordType,
      entityType: record.entityType,
      entityId: record.entityId,
      amount: record.amount,
      metadata,
      previousHash: record.previousHash,
      createdAt: record.createdAt,
    },
    hash
  );

  if (!hashMatches) {
    errors.push('Hash does not match record content');
  }

  // Check if anchored
  if (record.anchorStatus === 'anchored' && record.anchorTxHash && record.anchorChain) {
    isAnchored = true;
    anchorDetails = {
      chain: record.anchorChain,
      txHash: record.anchorTxHash,
      anchoredAt: record.anchoredAt!,
      explorerUrl: getExplorerUrl(record.anchorChain as ChainId, record.anchorTxHash),
    };

    // Look for Merkle proof
    const proof = await prisma.transparencyProof.findFirst({
      where: { recordId: record.id },
    });

    if (proof) {
      const proofData = JSON.parse(proof.proof || '{}') as MerkleProof;
      merkleProofValid = verifyMerkleProof(proofData);

      if (!merkleProofValid) {
        errors.push('Merkle proof validation failed');
      }
    }
  }

  return {
    isValid: recordExists && hashMatches && (isAnchored ? merkleProofValid : true),
    recordExists,
    hashMatches,
    merkleProofValid,
    isAnchored,
    anchorDetails,
    errors,
  };
}

/**
 * Generate and store a Merkle proof for a record
 */
export async function generateProofForRecord(
  recordId: string,
  batchHashes: string[],
  rootHash: string,
  anchorTxHash?: string
): Promise<{ id: string } | null> {
  const record = await prisma.transparencyRecord.findUnique({
    where: { id: recordId },
    select: { hash: true },
  });

  if (!record) return null;

  const index = batchHashes.indexOf(record.hash);
  if (index === -1) return null;

  const proof = generateMerkleProof(batchHashes, index);
  if (!proof) return null;

  const created = await prisma.transparencyProof.create({
    data: {
      recordId,
      proofType: 'merkle',
      proof: JSON.stringify(proof),
      rootHash,
      anchorTxHash,
      isValid: true,
      validatedAt: new Date(),
      expiresAt: null, // Proofs don't expire
    },
    select: { id: true },
  });

  return created;
}

/**
 * Get verification details for display
 */
export async function getVerificationDetails(hash: string): Promise<{
  record: {
    id: string;
    recordType: string;
    entityType: string;
    entityId: string;
    amount: number | null;
    createdAt: Date;
    anchorStatus: string;
  } | null;
  verification: VerificationResult;
  proof: MerkleProof | null;
}> {
  const record = await prisma.transparencyRecord.findUnique({
    where: { hash },
    select: {
      id: true,
      recordType: true,
      entityType: true,
      entityId: true,
      amount: true,
      createdAt: true,
      anchorStatus: true,
      proofs: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const verification = await verifyRecord(hash);

  let proof: MerkleProof | null = null;
  if (record?.proofs[0]) {
    proof = JSON.parse(record.proofs[0].proof || 'null');
  }

  return {
    record: record
      ? {
          id: record.id,
          recordType: record.recordType,
          entityType: record.entityType,
          entityId: record.entityId,
          amount: record.amount,
          createdAt: record.createdAt,
          anchorStatus: record.anchorStatus,
        }
      : null,
    verification,
    proof,
  };
}

/**
 * Batch anchor records and generate proofs
 */
export async function anchorRecordBatch(
  recordIds: string[],
  chain: ChainId,
  txHash: string
): Promise<{
  success: boolean;
  anchorId: string;
  proofsGenerated: number;
}> {
  // Get all records
  const records = await prisma.transparencyRecord.findMany({
    where: { id: { in: recordIds } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, hash: true },
  });

  const hashes = records.map((r) => r.hash);
  const rootHash = getMerkleRoot(hashes);

  if (!rootHash) {
    return { success: false, anchorId: '', proofsGenerated: 0 };
  }

  // Create anchor record
  const anchor = await prisma.transparencyAnchor.create({
    data: {
      chain,
      merkleRoot: rootHash,
      recordCount: records.length,
      fromRecordId: records[0].id,
      toRecordId: records[records.length - 1].id,
      txHash,
      status: 'confirmed',
      confirmedAt: new Date(),
    },
  });

  // Update records as anchored
  await prisma.transparencyRecord.updateMany({
    where: { id: { in: recordIds } },
    data: {
      anchorStatus: 'anchored',
      anchorTxHash: txHash,
      anchorChain: chain,
      anchoredAt: new Date(),
    },
  });

  // Generate proofs for each record
  let proofsGenerated = 0;
  for (const record of records) {
    const proof = await generateProofForRecord(record.id, hashes, rootHash, txHash);
    if (proof) proofsGenerated++;
  }

  return {
    success: true,
    anchorId: anchor.id,
    proofsGenerated,
  };
}

/**
 * Increment proof access count
 */
export async function recordProofAccess(recordId: string): Promise<void> {
  await prisma.transparencyProof.updateMany({
    where: { recordId },
    data: { accessCount: { increment: 1 } },
  });
}
