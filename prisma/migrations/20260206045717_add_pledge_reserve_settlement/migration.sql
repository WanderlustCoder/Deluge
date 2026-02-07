/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "totalShares" INTEGER NOT NULL,
    "sharesRemaining" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "purposeCategory" TEXT NOT NULL,
    "story" TEXT,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'funding',
    "tier" INTEGER NOT NULL DEFAULT 1,
    "latePayments" INTEGER NOT NULL DEFAULT 0,
    "fundingDeadline" DATETIME NOT NULL,
    "repaymentMonths" INTEGER NOT NULL,
    "monthlyPayment" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "seekingSponsor" BOOLEAN NOT NULL DEFAULT false,
    "sponsorshipAmount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "funderId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "repaid" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanShare_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LoanShare_funderId_fkey" FOREIGN KEY ("funderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanRepayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "principalPaid" REAL NOT NULL,
    "servicingFee" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanTierHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fromTier" INTEGER NOT NULL,
    "toTier" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanTierHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signupCredit" REAL NOT NULL DEFAULT 0,
    "actionCredit" REAL NOT NULL DEFAULT 0,
    "retentionCredit" REAL NOT NULL DEFAULT 0,
    "retentionCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" DATETIME,
    CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentDays" INTEGER NOT NULL DEFAULT 0,
    "longestDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT,
    "imageUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Community_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityProject_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Discussion_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discussionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    CONSTRAINT "ProjectVote_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectVote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "blockedCategories" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoleConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thresholds" TEXT NOT NULL,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LoanSponsorship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanSponsorship_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LoanSponsorship_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityElection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nominating',
    "nominationEnd" DATETIME NOT NULL,
    "votingEnd" DATETIME NOT NULL,
    "termEnd" DATETIME NOT NULL,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityElection_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectionNomination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "nomineeId" TEXT NOT NULL,
    "nominatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectionNomination_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "CommunityElection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectionVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "nomineeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectionVote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "CommunityElection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategicPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "fundingGoal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Aquifer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AquiferContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aquiferId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" REAL NOT NULL,
    "isDeluge" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AquiferContribution_aquiferId_fkey" FOREIGN KEY ("aquiferId") REFERENCES "Aquifer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AquiferContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlagshipProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "strategicPlanId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "fundingSource" TEXT NOT NULL DEFAULT 'reserve',
    "votingEndsAt" DATETIME,
    "tabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlagshipProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlagshipProject_strategicPlanId_fkey" FOREIGN KEY ("strategicPlanId") REFERENCES "StrategicPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlagshipVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flagshipProjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FlagshipVote_flagshipProjectId_fkey" FOREIGN KEY ("flagshipProjectId") REFERENCES "FlagshipProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlagshipVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlagshipSponsor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flagshipProjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FlagshipSponsor_flagshipProjectId_fkey" FOREIGN KEY ("flagshipProjectId") REFERENCES "FlagshipProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlagshipSponsor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RevenueSettlement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalGross" REAL NOT NULL,
    "totalPlatformCut" REAL NOT NULL,
    "totalWatershedCredit" REAL NOT NULL,
    "adViewCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "netTermDays" INTEGER NOT NULL DEFAULT 30,
    "expectedClearDate" DATETIME NOT NULL,
    "clearedAt" DATETIME,
    "providerRef" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlatformReserve" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance" REAL NOT NULL DEFAULT 0,
    "totalInflow" REAL NOT NULL DEFAULT 0,
    "totalOutflow" REAL NOT NULL DEFAULT 0,
    "totalReplenished" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReserveTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reserveId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReserveTransaction_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "PlatformReserve" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectDisbursement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "initiatedBy" TEXT,
    "paymentRef" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectDisbursement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "grossRevenue" REAL NOT NULL,
    "platformCut" REAL NOT NULL,
    "watershedCredit" REAL NOT NULL,
    "completionRate" REAL NOT NULL DEFAULT 1.0,
    "provider" TEXT NOT NULL DEFAULT 'demo',
    "format" TEXT NOT NULL DEFAULT 'video',
    "adUnitId" TEXT,
    "eCPM" REAL,
    "impressionId" TEXT,
    "settlementId" TEXT,
    "settlementStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdView_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "RevenueSettlement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AdView" ("createdAt", "grossRevenue", "id", "platformCut", "userId", "watershedCredit") SELECT "createdAt", "grossRevenue", "id", "platformCut", "userId", "watershedCredit" FROM "AdView";
DROP TABLE "AdView";
ALTER TABLE "new_AdView" RENAME TO "AdView";
CREATE INDEX "AdView_settlementStatus_idx" ON "AdView"("settlementStatus");
CREATE TABLE "new_Allocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pledged',
    "disbursedAt" DATETIME,
    "disbursementId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Allocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Allocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Allocation_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "ProjectDisbursement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Allocation" ("amount", "createdAt", "id", "projectId", "userId") SELECT "amount", "createdAt", "id", "projectId", "userId" FROM "Allocation";
DROP TABLE "Allocation";
ALTER TABLE "new_Allocation" RENAME TO "Allocation";
CREATE INDEX "Allocation_status_idx" ON "Allocation"("status");
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fundingGoal" REAL NOT NULL,
    "fundingRaised" REAL NOT NULL DEFAULT 0,
    "backerCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isFlagship" BOOLEAN NOT NULL DEFAULT false,
    "disbursedAmount" REAL NOT NULL DEFAULT 0,
    "disbursementStatus" TEXT NOT NULL DEFAULT 'none',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("backerCount", "category", "createdAt", "description", "fundingGoal", "fundingRaised", "id", "imageUrl", "location", "status", "title", "updatedAt") SELECT "backerCount", "category", "createdAt", "description", "fundingGoal", "fundingRaised", "id", "imageUrl", "location", "status", "title", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'user',
    "creditTier" INTEGER NOT NULL DEFAULT 1,
    "creditLimit" REAL NOT NULL DEFAULT 100,
    "lastTierUpdate" DATETIME,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" DATETIME,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "updatedAt") SELECT "createdAt", "email", "id", "name", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredId_key" ON "Referral"("referredId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_type_key" ON "Streak"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityProject_communityId_projectId_key" ON "CommunityProject"("communityId", "projectId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVote_communityId_projectId_userId_key" ON "ProjectVote"("communityId", "projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdPreference_userId_key" ON "AdPreference"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvite_email_key" ON "AdminInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvite_token_key" ON "AdminInvite"("token");

-- CreateIndex
CREATE INDEX "AdminInvite_token_idx" ON "AdminInvite"("token");

-- CreateIndex
CREATE INDEX "AdminInvite_email_idx" ON "AdminInvite"("email");

-- CreateIndex
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_role_key" ON "UserRole"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "RoleConfig_role_key" ON "RoleConfig"("role");

-- CreateIndex
CREATE UNIQUE INDEX "LoanSponsorship_loanId_sponsorId_key" ON "LoanSponsorship"("loanId", "sponsorId");

-- CreateIndex
CREATE INDEX "CommunityElection_communityId_status_idx" ON "CommunityElection"("communityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionNomination_electionId_nomineeId_key" ON "ElectionNomination"("electionId", "nomineeId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionVote_electionId_voterId_key" ON "ElectionVote"("electionId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Aquifer_type_key" ON "Aquifer"("type");

-- CreateIndex
CREATE INDEX "AquiferContribution_aquiferId_idx" ON "AquiferContribution"("aquiferId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagshipProject_projectId_key" ON "FlagshipProject"("projectId");

-- CreateIndex
CREATE INDEX "FlagshipProject_strategicPlanId_idx" ON "FlagshipProject"("strategicPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagshipVote_flagshipProjectId_userId_key" ON "FlagshipVote"("flagshipProjectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FlagshipSponsor_flagshipProjectId_userId_key" ON "FlagshipSponsor"("flagshipProjectId", "userId");

-- CreateIndex
CREATE INDEX "RevenueSettlement_status_idx" ON "RevenueSettlement"("status");

-- CreateIndex
CREATE INDEX "ReserveTransaction_reserveId_idx" ON "ReserveTransaction"("reserveId");

-- CreateIndex
CREATE INDEX "ReserveTransaction_type_idx" ON "ReserveTransaction"("type");

-- CreateIndex
CREATE INDEX "ProjectDisbursement_projectId_idx" ON "ProjectDisbursement"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDisbursement_status_idx" ON "ProjectDisbursement"("status");
