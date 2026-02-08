# Plan 27: Blockchain Transparency Ledger

## Overview

Optional blockchain-based immutable record of all platform transactions for radical transparency. Provides cryptographic proof of fund flows, impact claims, and organizational accountability. Complements (not replaces) existing transparency features.

**Note:** This is an advanced feature for institutions and power users who want cryptographic verification. The core platform works without blockchain.

---

## Phase 1: Transparency Ledger Foundation

### 1A. Ledger Schema

**Goal:** Store transaction records for blockchain anchoring.

**Schema Addition:**

```prisma
model TransparencyRecord {
  id              String   @id @default(cuid())
  recordType      String   // contribution, allocation, disbursement, impact
  entityType      String   // project, loan, community, watershed
  entityId        String
  amount          Float?
  metadata        Json     // Record details
  hash            String   @unique // SHA-256 of record
  previousHash    String?  // Chain link
  anchorStatus    String   @default("pending") // pending, anchored, failed
  anchorTxHash    String?  // Blockchain transaction hash
  anchorChain     String?  // ethereum, polygon, etc.
  anchoredAt      DateTime?
  createdAt       DateTime @default(now())

  @@index([entityType, entityId])
  @@index([anchorStatus])
  @@index([hash])
}

model TransparencyAnchor {
  id              String   @id @default(cuid())
  chain           String   // ethereum, polygon, solana
  merkleRoot      String   // Root hash of batch
  recordCount     Int
  fromRecordId    String
  toRecordId      String
  txHash          String   @unique
  blockNumber     Int?
  gasUsed         Float?
  costUsd         Float?
  status          String   @default("pending") // pending, confirmed, failed
  confirmedAt     DateTime?
  createdAt       DateTime @default(now())

  @@index([chain, status])
}
```

**Files:**
- `src/lib/blockchain/records.ts` - Record management
- `src/lib/blockchain/hashing.ts` - Hash generation
- `src/lib/blockchain/merkle.ts` - Merkle tree construction
- `src/app/api/transparency/records/route.ts`

### 1B. Record Creation

**Goal:** Automatically create records for key events.

**Integration Points:**
- Contribution received
- Allocation to project
- Loan funded/repaid
- Project milestone reached
- Impact metric recorded

**Files:**
- `src/lib/blockchain/recorder.ts` - Event listener
- `src/lib/blockchain/events.ts` - Event definitions
- Hooks into existing transaction flows

---

## Phase 2: Blockchain Anchoring

### 2A. Multi-Chain Support

**Goal:** Anchor to multiple blockchains.

**Supported Chains:**
- Ethereum (highest security, highest cost)
- Polygon (lower cost, fast)
- Solana (lowest cost, fastest)

**Files:**
- `src/lib/blockchain/chains/index.ts` - Chain abstraction
- `src/lib/blockchain/chains/ethereum.ts`
- `src/lib/blockchain/chains/polygon.ts`
- `src/lib/blockchain/chains/solana.ts`
- `src/lib/blockchain/config.ts` - Chain configuration

### 2B. Batch Anchoring

**Goal:** Efficient batched anchoring via Merkle trees.

**Files:**
- `src/lib/blockchain/batcher.ts` - Batch management
- `src/lib/blockchain/anchor.ts` - Anchoring logic
- `src/lib/blockchain/scheduler.ts` - Scheduled anchoring
- Cron job for periodic anchoring

### 2C. Cost Management

**Goal:** Optimize blockchain costs.

**Files:**
- `src/lib/blockchain/gas.ts` - Gas estimation
- `src/lib/blockchain/cost-tracker.ts` - Track costs
- `src/app/admin/blockchain/costs/page.tsx`

---

## Phase 3: Verification System

### 3A. Proof Generation

**Goal:** Generate verifiable proofs for any record.

**Schema Addition:**

```prisma
model TransparencyProof {
  id              String   @id @default(cuid())
  recordId        String
  proofType       String   // merkle, full_chain
  proof           Json     // Merkle proof data
  rootHash        String
  anchorTxHash    String?
  isValid         Boolean?
  validatedAt     DateTime?
  expiresAt       DateTime?
  accessCount     Int      @default(0)
  createdAt       DateTime @default(now())

  record TransparencyRecord @relation(fields: [recordId], references: [id])

  @@index([recordId])
}
```

**Files:**
- `src/lib/blockchain/proofs.ts` - Proof generation
- `src/lib/blockchain/verification.ts` - Proof verification
- `src/app/api/transparency/verify/route.ts`

### 3B. Public Verification

**Goal:** Anyone can verify records.

**Files:**
- `src/app/(marketing)/verify/page.tsx` - Verification page
- `src/app/(marketing)/verify/[hash]/page.tsx` - Specific record
- `src/components/blockchain/verification-form.tsx`
- `src/components/blockchain/proof-display.tsx`
- `src/components/blockchain/chain-explorer-link.tsx`

---

## Phase 4: Impact Certificates

### 4A. Certificate Generation

**Goal:** Issue verifiable impact certificates.

**Schema Addition:**

```prisma
model ImpactCertificate {
  id              String   @id @default(cuid())
  userId          String
  certificateType String   // contribution, project_backer, loan_funder
  entityType      String
  entityId        String
  amount          Float?
  impactClaim     String   // "Helped fund new playground"
  issuedAt        DateTime @default(now())
  recordHash      String   // Link to TransparencyRecord
  certificateHash String   @unique
  metadata        Json
  imageUrl        String?  // Generated certificate image
  isPublic        Boolean  @default(true)
  viewCount       Int      @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([certificateHash])
}
```

**Files:**
- `src/lib/blockchain/certificates.ts` - Certificate generation
- `src/app/api/certificates/route.ts`
- `src/app/(app)/certificates/page.tsx` - My certificates
- `src/app/(marketing)/certificate/[hash]/page.tsx` - Public view
- `src/components/blockchain/certificate-card.tsx`
- `src/components/blockchain/certificate-image.tsx`

### 4B. NFT Minting (Optional)

**Goal:** Mint certificates as NFTs for users who want them.

**Files:**
- `src/lib/blockchain/nft/index.ts` - NFT abstraction
- `src/lib/blockchain/nft/metadata.ts` - NFT metadata
- `src/lib/blockchain/nft/mint.ts` - Minting logic
- `src/components/blockchain/mint-nft-button.tsx`
- `src/components/blockchain/nft-gallery.tsx`

**Note:** NFTs are optional and user-initiated. No automatic minting.

---

## Phase 5: Organizational Accountability

### 5A. Organization Ledger

**Goal:** Track organizational fund flows.

**Schema Addition:**

```prisma
model OrganizationLedger {
  id              String   @id @default(cuid())
  organizationId  String   // Project proposer, community, institution
  organizationType String
  totalReceived   Float    @default(0)
  totalDisbursed  Float    @default(0)
  lastUpdated     DateTime @default(now())
  ledgerHash      String?  // Current state hash
  isPublic        Boolean  @default(true)

  @@unique([organizationId, organizationType])
}

model LedgerEntry {
  id              String   @id @default(cuid())
  ledgerId        String
  entryType       String   // received, disbursed, expense
  amount          Float
  description     String
  category        String?
  documentUrl     String?
  recordHash      String?  // Link to TransparencyRecord
  createdAt       DateTime @default(now())

  @@index([ledgerId, createdAt])
}
```

**Files:**
- `src/lib/blockchain/ledger.ts` - Ledger management
- `src/app/(app)/organizations/[id]/ledger/page.tsx`
- `src/components/blockchain/ledger-view.tsx`
- `src/components/blockchain/fund-flow-diagram.tsx`

### 5B. Audit Trail

**Goal:** Complete audit history for any entity.

**Files:**
- `src/lib/blockchain/audit.ts` - Audit trail
- `src/app/api/transparency/audit/[entityType]/[entityId]/route.ts`
- `src/components/blockchain/audit-trail.tsx`
- `src/components/blockchain/timeline-view.tsx`

---

## Phase 6: Dashboard & Analytics

### 6A. Transparency Dashboard

**Goal:** Public transparency metrics.

**Files:**
- `src/app/(marketing)/transparency/blockchain/page.tsx`
- `src/components/blockchain/anchoring-stats.tsx`
- `src/components/blockchain/verification-stats.tsx`
- `src/components/blockchain/recent-anchors.tsx`
- `src/components/blockchain/chain-status.tsx`

### 6B. Admin Dashboard

**Goal:** Manage blockchain infrastructure.

**Files:**
- `src/app/admin/blockchain/page.tsx`
- `src/components/admin/blockchain/anchor-queue.tsx`
- `src/components/admin/blockchain/failed-anchors.tsx`
- `src/components/admin/blockchain/cost-analysis.tsx`
- `src/components/admin/blockchain/chain-health.tsx`

### 6C. API for External Verification

**Goal:** External tools can verify Deluge records.

**Files:**
- `src/app/api/v1/transparency/verify/route.ts`
- `src/app/api/v1/transparency/records/route.ts`
- `src/app/api/v1/transparency/proofs/route.ts`
- OpenAPI documentation for transparency endpoints

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Ledger Foundation | Medium | Medium |
| 2 | Blockchain Anchoring | Large | Medium |
| 3 | Verification System | Medium | High |
| 4 | Impact Certificates | Medium | Medium |
| 5 | Organizational Accountability | Medium | Medium |
| 6 | Dashboard & Analytics | Medium | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add TransparencyRecord, TransparencyAnchor, TransparencyProof, ImpactCertificate, OrganizationLedger, LedgerEntry

### New Libraries
- `src/lib/blockchain/records.ts`
- `src/lib/blockchain/hashing.ts`
- `src/lib/blockchain/merkle.ts`
- `src/lib/blockchain/chains/*.ts`
- `src/lib/blockchain/batcher.ts`
- `src/lib/blockchain/anchor.ts`
- `src/lib/blockchain/proofs.ts`
- `src/lib/blockchain/verification.ts`
- `src/lib/blockchain/certificates.ts`
- `src/lib/blockchain/nft/*.ts`
- `src/lib/blockchain/ledger.ts`
- `src/lib/blockchain/audit.ts`

### Pages
- `src/app/(marketing)/verify/page.tsx`
- `src/app/(marketing)/certificate/[hash]/page.tsx`
- `src/app/(marketing)/transparency/blockchain/page.tsx`
- `src/app/(app)/certificates/page.tsx`
- `src/app/admin/blockchain/page.tsx`

---

## Cost Estimates

| Chain | Per-Anchor Cost | Batch Size | Cost per Record |
|-------|-----------------|------------|-----------------|
| Ethereum | $5-50 | 1000 | $0.005-0.05 |
| Polygon | $0.01-0.10 | 1000 | $0.00001-0.0001 |
| Solana | $0.001-0.01 | 1000 | $0.000001-0.00001 |

**Recommendation:** Use Polygon as default, Ethereum for high-value batches.

---

## Privacy Considerations

- Only hashes are stored on-chain, not actual data
- Personal information never on blockchain
- Users can opt-out of certificate generation
- Aggregate data only for organizational ledgers
- GDPR-compliant design

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test record creation and hashing
4. Verify Merkle tree construction
5. Test blockchain anchoring (testnet first)
6. Verify proof generation and validation
7. Test certificate generation
