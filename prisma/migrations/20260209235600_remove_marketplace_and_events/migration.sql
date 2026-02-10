-- CreateTable
CREATE TABLE "LoanStretchGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "purpose" TEXT NOT NULL,
    "funded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanStretchGoal_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "askerId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answeredAt" DATETIME,
    "flagCount" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanQuestion_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LoanQuestion_askerId_fkey" FOREIGN KEY ("askerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoalVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "photoUrls" TEXT NOT NULL,
    "receiptUrls" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "flagCount" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalVerification_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanRefinance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "previousPayment" REAL NOT NULL,
    "newPayment" REAL NOT NULL,
    "previousTerm" INTEGER NOT NULL,
    "newTerm" INTEGER NOT NULL,
    "fee" REAL NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanRefinance_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanDeadlineExtension" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "extensionDays" INTEGER NOT NULL,
    "extendedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanDeadlineExtension_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LoanDeadlineExtension_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BadgeProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeKey" TEXT NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "targetValue" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BadgeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrls" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImpactMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "reportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImpactMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectFollow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectFollow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rally" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rally_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rally_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RallyParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rallyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RallyParticipant_rallyId_fkey" FOREIGN KEY ("rallyId") REFERENCES "Rally" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RallyParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShareEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "platform" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShareEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityFeedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "actorId" TEXT,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "metadata" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cascades" TEXT NOT NULL DEFAULT 'all',
    "loanUpdates" TEXT NOT NULL DEFAULT 'all',
    "referrals" TEXT NOT NULL DEFAULT 'all',
    "communityNews" TEXT NOT NULL DEFAULT 'in_app',
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "pushToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "phone" TEXT,
    "website" TEXT,
    "imageUrl" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "revenue" REAL NOT NULL,
    "platformCut" REAL NOT NULL,
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BusinessListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BusinessView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedBusiness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedBusiness_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BusinessListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BusinessRecommendation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BusinessListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchingCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "corporateName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "matchRatio" REAL NOT NULL DEFAULT 1.0,
    "totalBudget" REAL NOT NULL,
    "remainingBudget" REAL NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetValue" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MatchingContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userAmount" REAL NOT NULL,
    "matchAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchingContribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MatchingCampaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "volunteerSlots" INTEGER NOT NULL,
    "watershedCredit" REAL NOT NULL,
    "requirements" TEXT NOT NULL,
    "beforePhotos" TEXT,
    "afterPhotos" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityGrant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityGrantVolunteer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'claimed',
    "completedAt" DATETIME,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityGrantVolunteer_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "CommunityGrant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityGrantVolunteer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "category" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityGoal_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityMilestone_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME,
    "location" TEXT,
    "type" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityEvent_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventRSVP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'attending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CommunityEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "category" TEXT,
    "metric" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChallengeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChallengeEntry_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CommunityChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectProposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fundingGoal" REAL NOT NULL,
    "deadline" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT,
    "gallery" TEXT,
    "orgName" TEXT NOT NULL,
    "orgType" TEXT NOT NULL,
    "ein" TEXT,
    "verificationDocs" TEXT,
    "fundsCover" TEXT NOT NULL,
    "successMetrics" TEXT NOT NULL,
    "reportingPlan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewerNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "projectId" TEXT,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectProposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFollow_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityFollow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityFollow_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "actionType" TEXT NOT NULL,
    "projectId" TEXT,
    "communityId" TEXT,
    "loanId" TEXT,
    "updateId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscussionMention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discussionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionMention_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiscussionMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CascadeSponsor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorType" TEXT NOT NULL,
    "businessId" TEXT,
    "campaignId" TEXT,
    "corporateName" TEXT,
    "tier" TEXT NOT NULL,
    "logoUrl" TEXT,
    "message" TEXT,
    "linkUrl" TEXT,
    "categories" TEXT,
    "locations" TEXT,
    "budgetTotal" REAL NOT NULL,
    "budgetUsed" REAL NOT NULL DEFAULT 0,
    "costPerCascade" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CascadeSponsor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessListing" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CascadeSponsor_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MatchingCampaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CascadeSponsorEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CascadeSponsorEvent_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "CascadeSponsor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CascadeSponsorEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationSponsor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 1000,
    "notificationTypes" TEXT NOT NULL,
    "budgetTotal" REAL NOT NULL,
    "budgetUsed" REAL NOT NULL DEFAULT 0,
    "costPerNotification" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationSponsor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationSponsorEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationSponsorEvent_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "NotificationSponsor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FloatSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "totalWatersheds" REAL NOT NULL,
    "totalReserve" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "dailyInterest" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RevenueRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "adViewCount" INTEGER,
    "businessCount" INTEGER,
    "loanVolume" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CostRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TransparencyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "totalRevenue" REAL NOT NULL,
    "totalCosts" REAL NOT NULL,
    "netMargin" REAL NOT NULL,
    "revenueBreakdown" TEXT NOT NULL,
    "totalFunded" REAL NOT NULL,
    "totalLoansIssued" REAL NOT NULL,
    "totalUsersActive" INTEGER NOT NULL,
    "pdfUrl" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sharedWatershedEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sharedWatershedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Family_sharedWatershedId_fkey" FOREIGN KEY ("sharedWatershedId") REFERENCES "Watershed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nickname" TEXT,
    "monthlyLimit" REAL,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "allowedCategories" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetType" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamilyGoal_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" TEXT,
    "communityId" TEXT,
    "badgeId" TEXT,
    "amount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PendingFamilyAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "approverId" TEXT,
    "actionType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "FamilyBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteriaType" TEXT NOT NULL,
    "criteriaValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FamilyBadgeEarned" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FamilyInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContributionReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contributionId" TEXT,
    "allocationId" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "projectName" TEXT,
    "communityName" TEXT,
    "receiptNumber" TEXT NOT NULL,
    "downloadedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContributionReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnualGivingSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalCashContributed" REAL NOT NULL DEFAULT 0,
    "totalAdFunded" REAL NOT NULL DEFAULT 0,
    "totalReferralCredits" REAL NOT NULL DEFAULT 0,
    "totalMatchingReceived" REAL NOT NULL DEFAULT 0,
    "totalAllocated" REAL NOT NULL DEFAULT 0,
    "projectsFunded" INTEGER NOT NULL DEFAULT 0,
    "loansFunded" INTEGER NOT NULL DEFAULT 0,
    "loansRepaid" REAL NOT NULL DEFAULT 0,
    "communitiesSupported" INTEGER NOT NULL DEFAULT 0,
    "deductibleAmount" REAL NOT NULL DEFAULT 0,
    "nonDeductibleAmount" REAL NOT NULL DEFAULT 0,
    "generatedAt" DATETIME,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AnnualGivingSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyAnnualSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalFamilyGiving" REAL NOT NULL DEFAULT 0,
    "memberBreakdown" TEXT NOT NULL,
    "projectsFunded" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" DATETIME,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecurringContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "nextChargeDate" DATETIME NOT NULL,
    "lastChargeDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "paymentMethodId" TEXT,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "pausedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringContributionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recurringContributionId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "chargeDate" DATETIME NOT NULL,
    "failureReason" TEXT,
    "contributionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecurringContributionHistory_recurringContributionId_fkey" FOREIGN KEY ("recurringContributionId") REFERENCES "RecurringContribution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "nextChargeDate" DATETIME NOT NULL,
    "lastChargeDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "pausedUntil" DATETIME,
    "pauseReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectSubscription_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunitySubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "allocationRule" TEXT NOT NULL DEFAULT 'neediest',
    "nextChargeDate" DATETIME NOT NULL,
    "lastChargeDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "pausedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunitySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunitySubscription_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalGivingGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalGivingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VolunteerOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hoursNeeded" REAL,
    "hoursLogged" REAL NOT NULL DEFAULT 0,
    "skillsRequired" TEXT,
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'open',
    "maxVolunteers" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VolunteerOpportunity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VolunteerSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'interested',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VolunteerSignup_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "VolunteerOpportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VolunteerSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VolunteerLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hours" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VolunteerLog_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "VolunteerOpportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VolunteerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'intermediate',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InKindDonation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" REAL,
    "status" TEXT NOT NULL DEFAULT 'offered',
    "receivedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InKindDonation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InKindDonation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectNeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER,
    "estimatedValue" REAL,
    "fulfilled" BOOLEAN NOT NULL DEFAULT false,
    "fulfilledBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectNeed_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "adminEmail" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'starter',
    "employeeLimit" INTEGER,
    "matchingBudget" REAL NOT NULL DEFAULT 0,
    "matchingSpent" REAL NOT NULL DEFAULT 0,
    "matchingRatio" REAL NOT NULL DEFAULT 1,
    "matchingCategories" TEXT,
    "billingEmail" TEXT,
    "contractStart" DATETIME,
    "contractEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CorporateEmployee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporateAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT,
    "department" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "CorporateEmployee_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CorporateEmployee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporateAccountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "usedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CorporateInvite_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateMatchingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporateAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalAmount" REAL NOT NULL,
    "matchedAmount" REAL NOT NULL,
    "projectId" TEXT,
    "loanId" TEXT,
    "category" TEXT,
    "matchDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CorporateMatchingRecord_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporateAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "targetAmount" REAL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "matchingBonus" REAL,
    "featuredProjects" TEXT,
    "categories" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CorporateCampaign_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporateAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "data" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CorporateReport_corporateAccountId_fkey" FOREIGN KEY ("corporateAccountId") REFERENCES "CorporateAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GivingCircle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "memberLimit" INTEGER,
    "minContribution" REAL,
    "pooledBalance" REAL NOT NULL DEFAULT 0,
    "totalContributed" REAL NOT NULL DEFAULT 0,
    "totalDeployed" REAL NOT NULL DEFAULT 0,
    "votingThreshold" REAL NOT NULL DEFAULT 0.5,
    "votingPeriod" INTEGER NOT NULL DEFAULT 7,
    "focusCategories" TEXT,
    "focusCommunities" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CircleMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "totalContributed" REAL NOT NULL DEFAULT 0,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "CircleMember_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CircleMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CircleContribution_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "email" TEXT,
    "token" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "usedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CircleInvite_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleProposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "projectId" TEXT,
    "loanId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL,
    "votingEnds" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'voting',
    "yesVotes" INTEGER NOT NULL DEFAULT 0,
    "noVotes" INTEGER NOT NULL DEFAULT 0,
    "abstainVotes" INTEGER NOT NULL DEFAULT 0,
    "fundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CircleProposal_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CircleVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "CircleProposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorId" TEXT,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CircleActivity_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleDiscussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CircleDiscussion_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleRecurring" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "nextChargeDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CircleRecurring_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "GivingCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GivingOccasion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "imageUrl" TEXT,
    "iconName" TEXT,
    "color" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "matchingBonus" REAL,
    "featuredProjects" TEXT,
    "categories" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "communityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GiftContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contributorId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "occasionType" TEXT NOT NULL,
    "message" TEXT,
    "amount" REAL NOT NULL,
    "projectId" TEXT,
    "communityId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationDate" DATETIME,
    "certificateUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftContribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BirthdayFundraiser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "communityId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "birthdayDate" DATETIME NOT NULL,
    "goalAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "backerCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "shareUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BirthdayFundraiser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BirthdayFundraiser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmergencyCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "affectedArea" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "targetAmount" REAL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "backerCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedOrgs" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "updateFrequency" TEXT NOT NULL DEFAULT 'daily',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmergencyUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmergencyUpdate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmergencyCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledGift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "occasionId" TEXT,
    "customOccasion" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "projectId" TEXT,
    "communityId" TEXT,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledGift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScheduledGift_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "GivingOccasion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeasonalCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "platformGoal" REAL,
    "platformProgress" REAL NOT NULL DEFAULT 0,
    "matchingPartner" TEXT,
    "matchingRatio" REAL,
    "heroImageUrl" TEXT,
    "themeColor" TEXT,
    "featuredProjects" TEXT,
    "badges" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreditReportingConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentDate" DATETIME NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "withdrawnAt" DATETIME,
    "withdrawnReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditReportingConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditReportingConsent_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditReportingStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "isReporting" BOOLEAN NOT NULL DEFAULT false,
    "bureaus" TEXT,
    "firstReportDate" DATETIME,
    "lastReportDate" DATETIME,
    "reportingErrors" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditReportingStatus_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metro2Record" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "reportingPeriod" DATETIME NOT NULL,
    "accountStatus" TEXT NOT NULL,
    "paymentHistory" TEXT NOT NULL,
    "currentBalance" REAL NOT NULL,
    "amountPastDue" REAL NOT NULL DEFAULT 0,
    "dateOpened" DATETIME NOT NULL,
    "scheduledPayment" REAL NOT NULL,
    "actualPayment" REAL,
    "rawData" TEXT NOT NULL,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME,
    "accepted" BOOLEAN,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Metro2Record_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BureauConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bureau" TEXT NOT NULL,
    "furnisherId" TEXT NOT NULL,
    "apiEndpoint" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastSubmission" DATETIME,
    "lastSuccess" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BureauSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bureau" TEXT NOT NULL,
    "reportingPeriod" DATETIME NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "fileReference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" DATETIME,
    "responseAt" DATETIME,
    "acceptedCount" INTEGER,
    "rejectedCount" INTEGER,
    "errorDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CreditDispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "disputeType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "bureauNotified" BOOLEAN NOT NULL DEFAULT false,
    "bureauNotifiedAt" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditDispute_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditDispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditDisputeNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditDisputeNote_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "CreditDispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityAdvocate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "region" TEXT,
    "communityIds" TEXT,
    "interests" TEXT,
    "bio" TEXT,
    "publicProfile" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityAdvocate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvocateInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "interests" TEXT,
    "availability" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "welcomedBy" TEXT,
    "welcomedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvocateInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvocateActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advocateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "communityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvocateActivity_advocateId_fkey" FOREIGN KEY ("advocateId") REFERENCES "CommunityAdvocate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvocateEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advocateId" TEXT NOT NULL,
    "communityId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME,
    "location" TEXT,
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "virtualLink" TEXT,
    "recap" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdvocateEvent_advocateId_fkey" FOREIGN KEY ("advocateId") REFERENCES "CommunityAdvocate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvocateEventRSVP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvocateEventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "AdvocateEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvocateResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdvocateAppreciation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advocateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "sentBy" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProjectVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'unverified',
    "organizationVerified" BOOLEAN NOT NULL DEFAULT false,
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "outcomeVerified" BOOLEAN NOT NULL DEFAULT false,
    "trustScore" REAL,
    "lastVerifiedAt" DATETIME,
    "lastVerifiedBy" TEXT,
    "expiresAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectVerification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "verificationId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "evidence" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationCheck_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "ProjectVerification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdentityVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT,
    "providerRef" TEXT,
    "documentType" TEXT,
    "verifiedName" TEXT,
    "verifiedAddress" TEXT,
    "verifiedAt" DATETIME,
    "expiresAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IdentityVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "businessId" TEXT,
    "organizationName" TEXT NOT NULL,
    "ein" TEXT,
    "registrationNumber" TEXT,
    "registrationType" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "documents" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OutcomeVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "outcomeType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" REAL,
    "actualValue" REAL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "verificationMethod" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutcomeVerification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outcomeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "comment" TEXT,
    "evidence" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityVerification_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "OutcomeVerification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "verificationId" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "auditorOrg" TEXT,
    "auditType" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "findings" TEXT,
    "rating" TEXT,
    "reportUrl" TEXT,
    "startDate" DATETIME NOT NULL,
    "completedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectAudit_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "ProjectVerification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Auditor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "auditsCompleted" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Auditor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reportedBy" TEXT,
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectFlag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastUsedAt" DATETIME,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "revokedReason" TEXT,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiRequestLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apiKeyId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiRequestLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggeredAt" DATETIME,
    "lastSuccessAt" DATETIME,
    "lastErrorAt" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthApp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "redirectUris" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretHash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OAuthApp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthAuthorization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "authCode" TEXT,
    "codeExpiresAt" DATETIME,
    "accessToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OAuthAuthorization_appId_fkey" FOREIGN KEY ("appId") REFERENCES "OAuthApp" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OAuthAuthorization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInterestProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "categories" TEXT NOT NULL DEFAULT '{}',
    "communities" TEXT NOT NULL DEFAULT '{}',
    "projectTypes" TEXT NOT NULL DEFAULT '{}',
    "givingPatterns" TEXT NOT NULL DEFAULT '{}',
    "locationPrefs" TEXT NOT NULL DEFAULT '{}',
    "timePrefs" TEXT NOT NULL DEFAULT '{}',
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInterestProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserSimilarity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "similarUserId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "basis" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProjectSimilarity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "similarProjectId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "basis" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "signals" TEXT NOT NULL,
    "shown" BOOLEAN NOT NULL DEFAULT false,
    "shownAt" DATETIME,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" DATETIME,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "breakdown" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DigestPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'weekly',
    "dayOfWeek" INTEGER,
    "categories" TEXT NOT NULL DEFAULT '[]',
    "includeLoans" BOOLEAN NOT NULL DEFAULT true,
    "includeVolunteer" BOOLEAN NOT NULL DEFAULT true,
    "lastSent" DATETIME,
    "nextSend" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DigestPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscoveryChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "reward" TEXT NOT NULL,
    "rewardAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscoveryChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecommendationMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "algorithm" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "avgPosition" REAL,
    "avgScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LearningResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "estimatedMinutes" INTEGER,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GivingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "monthlyTarget" REAL,
    "yearlyTarget" REAL,
    "method" TEXT NOT NULL DEFAULT 'flexible',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GivingPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReflectionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReflectionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GivingScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "considerations" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LearningDiscussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceId" TEXT,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningDiscussion_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LearningResource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discussionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "LearningDiscussion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyCircle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT,
    "facilitatorId" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "maxMembers" INTEGER NOT NULL DEFAULT 12,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StudyCircleMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyCircleMember_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "StudyCircle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT,
    CONSTRAINT "LearningCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0D47A1',
    "secondaryColor" TEXT NOT NULL DEFAULT '#00897B',
    "customDomain" TEXT,
    "adminEmail" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'standard',
    "features" TEXT NOT NULL DEFAULT '[]',
    "limits" TEXT NOT NULL DEFAULT '{}',
    "contractStart" DATETIME NOT NULL,
    "contractEnd" DATETIME,
    "monthlyFee" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InstitutionAdmin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "permissions" TEXT NOT NULL DEFAULT '[]',
    "invitedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstitutionAdmin_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstitutionSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "allowPublicProjects" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "enableLoans" BOOLEAN NOT NULL DEFAULT true,
    "enableCommunities" BOOLEAN NOT NULL DEFAULT true,
    "customCategories" TEXT NOT NULL DEFAULT '[]',
    "defaultWatershed" REAL NOT NULL DEFAULT 0,
    "emailFromName" TEXT,
    "emailReplyTo" TEXT,
    "socialLinks" TEXT,
    "customFooter" TEXT,
    "customCss" TEXT,
    "analyticsId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstitutionSettings_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstitutionPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showInNav" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstitutionPage_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstitutionReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstitutionReport_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstitutionSSO" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "entityId" TEXT,
    "metadataUrl" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstitutionSSO_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UniversitySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "alumniAccess" BOOLEAN NOT NULL DEFAULT true,
    "studentVerification" BOOLEAN NOT NULL DEFAULT false,
    "departmentCodes" TEXT NOT NULL DEFAULT '[]',
    "graduationYears" TEXT NOT NULL DEFAULT '{}',
    "greekLife" BOOLEAN NOT NULL DEFAULT false,
    "athletics" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UniversitySettings_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CitySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "neighborhoods" TEXT NOT NULL DEFAULT '[]',
    "councilDistricts" TEXT NOT NULL DEFAULT '{}',
    "budgetIntegration" BOOLEAN NOT NULL DEFAULT false,
    "publicMeetings" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CitySettings_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoundationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institutionId" TEXT NOT NULL,
    "grantCycles" TEXT NOT NULL DEFAULT '[]',
    "fundTypes" TEXT NOT NULL DEFAULT '[]',
    "minimumGrant" REAL NOT NULL DEFAULT 1000,
    "requiresApplication" BOOLEAN NOT NULL DEFAULT true,
    "reviewProcess" TEXT NOT NULL DEFAULT 'committee',
    CONSTRAINT "FoundationSettings_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mentor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "maxMentees" INTEGER NOT NULL DEFAULT 3,
    "currentMentees" INTEGER NOT NULL DEFAULT 0,
    "preferredStyle" TEXT NOT NULL,
    "languages" TEXT NOT NULL DEFAULT '["en"]',
    "timezone" TEXT,
    "isAccepting" BOOLEAN NOT NULL DEFAULT true,
    "applicationDate" DATETIME NOT NULL,
    "approvedDate" DATETIME,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalMentees" INTEGER NOT NULL DEFAULT 0,
    "avgRating" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mentor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mentee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "challenges" TEXT,
    "preferredStyle" TEXT NOT NULL DEFAULT 'any',
    "timezone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'seeking',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mentee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "goals" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "nextCheckIn" DATETIME,
    "notes" TEXT,
    "completionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mentorship_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mentorship_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentorMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorshipId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentorMessage_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentorSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorshipId" TEXT,
    "mentorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "meetingLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentorSession_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MentorSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MentorReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorId" TEXT NOT NULL,
    "mentorshipId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "content" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MentorReview_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenteeGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentorshipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "progress" REAL NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenteeGoal_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenteeMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MenteeMilestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "MenteeGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "facilitatorId" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 12,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "meetingSchedule" TEXT,
    "timezone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SupportGroupMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "SupportGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SupportGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportGroupMeeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "title" TEXT,
    "scheduledAt" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "topic" TEXT,
    "notes" TEXT,
    "recordingUrl" TEXT,
    "attendeeCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportGroupMeeting_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SupportGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportGroupPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportGroupPost_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SupportGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportGroupReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportGroupReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SupportGroupPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImpactStory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "authorRole" TEXT,
    "projectId" TEXT,
    "communityId" TEXT,
    "loanId" TEXT,
    "mediaUrls" TEXT NOT NULL DEFAULT '[]',
    "videoUrl" TEXT,
    "quotes" TEXT,
    "impactMetrics" TEXT,
    "location" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImpactStory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ImpactStory_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trigger" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "followUpQuestions" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorTitle" TEXT,
    "authorImageUrl" TEXT,
    "rating" REAL,
    "type" TEXT NOT NULL,
    "entityId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlatformImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "displayValue" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BeforeAfter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT,
    "beforeImage" TEXT NOT NULL,
    "afterImage" TEXT NOT NULL,
    "beforeDate" DATETIME,
    "afterDate" DATETIME,
    "caption" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BeforeAfter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyId" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "ImpactStory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoryShare_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "ImpactStory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "targetCount" INTEGER,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserLocale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "dateFormat" TEXT,
    "numberFormat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLocale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "translatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AccessibilityPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "fontFamily" TEXT NOT NULL DEFAULT 'default',
    "lineSpacing" TEXT NOT NULL DEFAULT 'normal',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "screenReader" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccessibilityPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "funderId" TEXT NOT NULL,
    "funderType" TEXT NOT NULL,
    "totalBudget" REAL NOT NULL,
    "remainingBudget" REAL NOT NULL,
    "minGrant" REAL NOT NULL DEFAULT 1000,
    "maxGrant" REAL NOT NULL DEFAULT 50000,
    "categories" TEXT NOT NULL DEFAULT '[]',
    "eligibility" TEXT NOT NULL DEFAULT '{}',
    "focusAreas" TEXT NOT NULL DEFAULT '[]',
    "geographicFocus" TEXT NOT NULL DEFAULT '[]',
    "applicationStart" DATETIME NOT NULL,
    "applicationEnd" DATETIME NOT NULL,
    "reviewStart" DATETIME,
    "awardDate" DATETIME,
    "reportingRequired" BOOLEAN NOT NULL DEFAULT true,
    "reportingFrequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GrantReviewer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reviewer',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrantReviewer_programId_fkey" FOREIGN KEY ("programId") REFERENCES "GrantProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "projectSummary" TEXT NOT NULL,
    "requestedAmount" REAL NOT NULL,
    "proposedBudget" TEXT NOT NULL DEFAULT '{}',
    "timeline" TEXT NOT NULL DEFAULT '[]',
    "teamMembers" TEXT NOT NULL DEFAULT '[]',
    "impactStatement" TEXT NOT NULL,
    "measurableOutcomes" TEXT NOT NULL DEFAULT '[]',
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "answers" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" DATETIME,
    "lastSavedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrantApplication_programId_fkey" FOREIGN KEY ("programId") REFERENCES "GrantProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GrantApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT NOT NULL DEFAULT '[]',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "maxLength" INTEGER,
    "helpText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "section" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrantQuestion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "GrantProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "scores" TEXT NOT NULL DEFAULT '{}',
    "overallScore" REAL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendation" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrantReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GrantApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantRubric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrantRubric_programId_fkey" FOREIGN KEY ("programId") REFERENCES "GrantProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrantFeedback_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GrantApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantAward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "awardedAmount" REAL NOT NULL,
    "conditions" TEXT,
    "disbursementSchedule" TEXT NOT NULL DEFAULT '[]',
    "totalDisbursed" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrantAward_programId_fkey" FOREIGN KEY ("programId") REFERENCES "GrantProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GrantAward_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GrantApplication" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantDisbursement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "awardId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "disbursedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GrantDisbursement_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "GrantAward" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "awardId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "content" TEXT NOT NULL DEFAULT '{}',
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "feedback" TEXT,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GrantReport_programId_fkey" FOREIGN KEY ("programId") REFERENCES "GrantProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantReportTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sections" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TransparencyRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "amount" REAL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "hash" TEXT NOT NULL,
    "previousHash" TEXT,
    "anchorStatus" TEXT NOT NULL DEFAULT 'pending',
    "anchorTxHash" TEXT,
    "anchorChain" TEXT,
    "anchoredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TransparencyAnchor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chain" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "fromRecordId" TEXT NOT NULL,
    "toRecordId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "gasUsed" REAL,
    "costUsd" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TransparencyProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "proof" TEXT NOT NULL DEFAULT '{}',
    "rootHash" TEXT NOT NULL,
    "anchorTxHash" TEXT,
    "isValid" BOOLEAN,
    "validatedAt" DATETIME,
    "expiresAt" DATETIME,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransparencyProof_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "TransparencyRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImpactCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "amount" REAL,
    "impactClaim" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordHash" TEXT NOT NULL,
    "certificateHash" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ImpactCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL,
    "totalReceived" REAL NOT NULL DEFAULT 0,
    "totalDisbursed" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ledgerHash" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ledgerId" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "documentUrl" TEXT,
    "recordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "OrganizationLedger" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "flagType" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "reason" TEXT,
    "details" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "action" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SearchEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "embedding" BLOB NOT NULL,
    "text" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "dimensions" INTEGER NOT NULL DEFAULT 1536,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProjectPrediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "successProb" REAL NOT NULL,
    "predictedDays" INTEGER,
    "riskFactors" TEXT NOT NULL DEFAULT '[]',
    "strengthFactors" TEXT NOT NULL DEFAULT '[]',
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AIAssistanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assistType" TEXT NOT NULL,
    "inputLength" INTEGER NOT NULL,
    "outputLength" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "costUsd" REAL,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "messages" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrendAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trendType" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "changePercent" REAL,
    "momentum" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CommunityWish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "fulfilledBy" TEXT,
    "fulfilledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PledgeCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "story" TEXT,
    "videoUrl" TEXT,
    "coverImageUrl" TEXT,
    "goalAmount" REAL NOT NULL,
    "minimumAmount" REAL,
    "pledgedAmount" REAL NOT NULL DEFAULT 0,
    "backerCount" INTEGER NOT NULL DEFAULT 0,
    "fundingType" TEXT NOT NULL DEFAULT 'all_or_nothing',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fundedAt" DATETIME,
    "settledAt" DATETIME,
    "stretchGoals" TEXT,
    "faqs" TEXT,
    "updateCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PledgeCampaign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PledgeCampaign_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT,
    "amount" REAL NOT NULL,
    "tipAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "paymentMethodId" TEXT,
    "paymentIntentId" TEXT,
    "collectedAt" DATETIME,
    "cancelledAt" DATETIME,
    "refundedAt" DATETIME,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pledge_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PledgeCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pledge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pledge_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "CampaignReward" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "quantity" INTEGER,
    "claimed" INTEGER NOT NULL DEFAULT 0,
    "estimatedDelivery" DATETIME,
    "deliveryType" TEXT NOT NULL DEFAULT 'digital',
    "shippingRequired" BOOLEAN NOT NULL DEFAULT false,
    "shippingCost" REAL,
    "imageUrl" TEXT,
    "items" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignReward_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PledgeCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardFulfillment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pledgeId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shippingAddress" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "notes" TEXT,
    "fulfilledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RewardFulfillment_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "Pledge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isBackersOnly" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignUpdate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PledgeCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "isCreator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignComment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PledgeCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CampaignComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CampaignComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "purchaserId" TEXT,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "amount" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'active',
    "designId" TEXT,
    "personalMessage" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'email',
    "deliveryDate" DATETIME,
    "deliveredAt" DATETIME,
    "redeemedBy" TEXT,
    "redeemedAt" DATETIME,
    "expiresAt" DATETIME,
    "orderId" TEXT,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiftCard_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GiftCard_redeemedBy_fkey" FOREIGN KEY ("redeemedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GiftCard_designId_fkey" FOREIGN KEY ("designId") REFERENCES "GiftCardDesign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GiftCard_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GiftCardOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftCardDesign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "giftCardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceBefore" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftCardOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaserId" TEXT NOT NULL,
    "organizationName" TEXT,
    "quantity" INTEGER NOT NULL,
    "denomination" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "discountPercent" REAL,
    "discountAmount" REAL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveryType" TEXT NOT NULL DEFAULT 'codes',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PhysicalCardOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingMethod" TEXT NOT NULL,
    "shippingCost" REAL NOT NULL,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "printedAt" DATETIME,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhysicalCardOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GiftCardOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "lifetimeEarned" REAL NOT NULL DEFAULT 0,
    "lifetimeSpent" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoreCreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creditId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceBefore" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreCreditTransaction_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "StoreCredit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'fixed',
    "minPurchase" REAL,
    "maxDiscount" REAL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "userLimit" INTEGER,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableTo" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PromoCodeUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promoCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "discount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromoCodeUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NonprofitOrganization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT,
    "ein" TEXT,
    "type" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "address" TEXT,
    "focusAreas" TEXT,
    "geographicScope" TEXT NOT NULL DEFAULT 'local',
    "foundedYear" INTEGER,
    "annualBudget" TEXT,
    "employeeCount" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "title" TEXT,
    "permissions" TEXT,
    "invitedBy" TEXT,
    "invitedAt" DATETIME,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "expiresAt" DATETIME,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationDonation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "donorId" TEXT,
    "donorName" TEXT,
    "donorEmail" TEXT,
    "amount" REAL NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "acknowledgedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationDonation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DonorRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "totalDonated" REAL NOT NULL DEFAULT 0,
    "donationCount" INTEGER NOT NULL DEFAULT 0,
    "firstDonation" DATETIME,
    "lastDonation" DATETIME,
    "averageDonation" REAL,
    "segment" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DonorRelationship_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER,
    "data" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "config" TEXT,
    "lastSyncAt" DATETIME,
    "syncStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "properties" TEXT,
    "context" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "deviceId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "device" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metricType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "dimensions" TEXT,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL DEFAULT 'user',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "layout" TEXT,
    "filters" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dashboardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "config" TEXT,
    "dataSource" TEXT NOT NULL,
    "position" TEXT,
    "refreshRate" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DashboardShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dashboardId" TEXT NOT NULL,
    "sharedWith" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DashboardShare_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsFunnel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SavedQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "query" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metricType" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL,
    "severity" TEXT NOT NULL,
    "expected" REAL NOT NULL,
    "actual" REAL NOT NULL,
    "deviation" REAL NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "source" TEXT NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserCurrencyPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayCurrency" TEXT NOT NULL DEFAULT 'USD',
    "paymentCurrency" TEXT NOT NULL DEFAULT 'USD',
    "autoConvert" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserCurrencyPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransactionCurrency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "originalAmount" REAL NOT NULL,
    "originalCurrency" TEXT NOT NULL,
    "convertedAmount" REAL NOT NULL,
    "convertedCurrency" TEXT NOT NULL,
    "exchangeRate" REAL NOT NULL,
    "rateTimestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "numberFormat" TEXT NOT NULL,
    "taxIdLabel" TEXT,
    "taxIdFormat" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "launchDate" DATETIME,
    "config" TEXT
);

-- CreateTable
CREATE TABLE "UserRegion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "overrideRegion" TEXT,
    CONSTRAINT "UserRegion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "regions" TEXT NOT NULL,
    "currencies" TEXT NOT NULL,
    "minAmount" REAL,
    "maxAmount" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT
);

-- CreateTable
CREATE TABLE "UserPaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "methodCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountDetails" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayoutAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxJurisdiction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "rate" REAL,
    "threshold" REAL,
    "registrationReq" BOOLEAN NOT NULL DEFAULT false,
    "rules" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "OrganizationTaxStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "taxExempt" BOOLEAN NOT NULL DEFAULT false,
    "taxId" TEXT,
    "exemptionDoc" TEXT,
    "verifiedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationTaxStatus_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "NonprofitOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationTaxStatus_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "TaxJurisdiction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegionLaunch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "betaUsers" TEXT NOT NULL,
    "launchDate" DATETIME,
    "checklist" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT,
    "providerMessageId" TEXT,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "failedAt" DATETIME,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationDigest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "notificationIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationDigest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "titleTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "richBodyTemplate" TEXT,
    "emailTemplate" TEXT,
    "pushTemplate" TEXT,
    "smsTemplate" TEXT,
    "variables" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationTrigger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "conditions" TEXT,
    "templateId" TEXT NOT NULL,
    "channels" TEXT NOT NULL,
    "delay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotificationMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "profileUrl" TEXT,
    "avatarUrl" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" DATETIME,
    "scope" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "shareType" TEXT NOT NULL,
    "shareUrl" TEXT,
    "postId" TEXT,
    "impressions" INTEGER,
    "clicks" INTEGER,
    "conversions" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT,
    "linkUrl" TEXT,
    "scheduledFor" DATETIME,
    "postedAt" DATETIME,
    "postId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "errorMessage" TEXT,
    "metrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportedContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "matchedUserId" TEXT,
    "invitedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportedContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "mediaExample" TEXT,
    "goalType" TEXT NOT NULL,
    "goalValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SocialChallengeParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postUrl" TEXT,
    "platform" TEXT,
    "amountRaised" REAL NOT NULL DEFAULT 0,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialChallengeParticipant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "SocialChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "milestoneType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reachedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "celebratedAt" DATETIME,
    "sharedAt" DATETIME,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "ReflectionCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "period" TEXT,
    "stats" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReflectionCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SharedJourney" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "targetType" TEXT,
    "targetValue" REAL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" TEXT NOT NULL DEFAULT 'members',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JourneyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journeyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "contribution" REAL NOT NULL DEFAULT 0,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JourneyMember_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "SharedJourney" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JourneyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JourneyMoment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journeyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JourneyMoment_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "SharedJourney" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReflectionPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ThankYouNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fromName" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "mediaUrl" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "grantedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsentPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'public',
    "showGivingHistory" BOOLEAN NOT NULL DEFAULT false,
    "showBadges" BOOLEAN NOT NULL DEFAULT true,
    "showCommunities" BOOLEAN NOT NULL DEFAULT true,
    "allowTagging" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" TEXT NOT NULL DEFAULT 'followers',
    "showOnLeaderboards" BOOLEAN NOT NULL DEFAULT true,
    "dataRetention" TEXT NOT NULL DEFAULT 'indefinite',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "retention" TEXT NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "purposes" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "processedBy" TEXT,
    "resultUrl" TEXT,
    "expiresAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "DataRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecuritySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceName" TEXT,
    "deviceType" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecuritySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TwoFactorAuth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "secret" TEXT,
    "phone" TEXT,
    "backupCodes" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TwoFactorAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousState" TEXT,
    "newState" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" DATETIME NOT NULL,
    "windowEnd" DATETIME NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedUntil" DATETIME
);

-- CreateTable
CREATE TABLE "SuspiciousActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "indicators" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AccountRecovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "conditions" TEXT,
    "actions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" DATETIME,
    "lastStatus" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "automationId" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "triggerData" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    CONSTRAINT "AutomationRun_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stepHistory" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "metadata" TEXT,
    CONSTRAINT "WorkflowInstance_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "AdminWorkflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instanceId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowApproval_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "WorkflowInstance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "taskType" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "config" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "lastStatus" TEXT,
    "nextRunAt" DATETIME,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaskRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "output" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    CONSTRAINT "TaskRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ScheduledTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "entityType" TEXT,
    "conditions" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RuleEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "result" TEXT,
    "evaluatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RuleEvaluation_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BusinessRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BulkOperation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "criteria" TEXT,
    "entityIds" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errors" TEXT,
    "createdBy" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WorkQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL DEFAULT 'manual',
    "assignees" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "slaMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QueueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queueId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueAt" DATETIME,
    "assignedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QueueItem_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "WorkQueue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatershedLoan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "selfFundedAmount" REAL NOT NULL,
    "communityFundedAmount" REAL NOT NULL,
    "remainingBalance" REAL NOT NULL,
    "communityRemainingBalance" REAL NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "originationFee" REAL NOT NULL DEFAULT 0,
    "monthlyPayment" REAL NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "paymentsRemaining" INTEGER NOT NULL,
    "nextPaymentDate" DATETIME,
    "fundingDeadline" DATETIME,
    "portfolioValueAtOrigination" REAL,
    "fundingLockActive" BOOLEAN NOT NULL DEFAULT false,
    "communityRepaidAt" DATETIME,
    "disbursedAt" DATETIME,
    "completedAt" DATETIME,
    "defaultedAt" DATETIME,
    "recoveryStartedAt" DATETIME,
    "recoveryPayments" INTEGER NOT NULL DEFAULT 0,
    "latePayments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatershedLoan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatershedLoanShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "funderId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "repaid" REAL NOT NULL DEFAULT 0,
    "isSelfFunded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatershedLoanShare_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "WatershedLoan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatershedLoanShare_funderId_fkey" FOREIGN KEY ("funderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatershedLoanPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "watershedLoanId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "appliedToCommunity" REAL NOT NULL,
    "appliedToSelf" REAL NOT NULL,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatershedLoanPayment_watershedLoanId_fkey" FOREIGN KEY ("watershedLoanId") REFERENCES "WatershedLoan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatershedLoanPayment_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EfficiencyHome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "homeType" TEXT NOT NULL,
    "yearBuilt" INTEGER,
    "squareFootage" INTEGER,
    "ownershipStatus" TEXT NOT NULL,
    "entryTrack" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "currentEnergyBill" REAL,
    "energyScoreBefore" INTEGER,
    "energyScoreAfter" INTEGER,
    "roofOrientation" TEXT,
    "shadingFactor" TEXT,
    "solarCapacityKw" REAL,
    "solarGenerationKwh" REAL,
    "neighborhoodBatchId" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EfficiencyHome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EfficiencyHome_neighborhoodBatchId_fkey" FOREIGN KEY ("neighborhoodBatchId") REFERENCES "NeighborhoodCascade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EfficiencyAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeId" TEXT NOT NULL,
    "insulationCondition" TEXT,
    "windowType" TEXT,
    "hvacAge" INTEGER,
    "hvacType" TEXT,
    "waterHeaterType" TEXT,
    "roofCondition" TEXT,
    "electricalPanelAmps" INTEGER,
    "efficiencyScore" INTEGER,
    "upgradePlan" TEXT,
    "costEstimates" TEXT,
    "totalEstimatedCost" REAL NOT NULL DEFAULT 0,
    "projectedSavingsKwh" REAL,
    "projectedSavingsDollars" REAL,
    "projectedCo2Reduction" REAL,
    "assessedBy" TEXT,
    "assessorNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EfficiencyAssessment_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "EfficiencyHome" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EfficiencyPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "phaseName" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "actualCost" REAL,
    "fundingTrack" TEXT,
    "amountFunded" REAL NOT NULL DEFAULT 0,
    "fundingComplete" BOOLEAN NOT NULL DEFAULT false,
    "gapAmount" REAL,
    "gapFunded" REAL NOT NULL DEFAULT 0,
    "projectId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "contractorName" TEXT,
    "contractorNotes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EfficiencyPhase_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "EfficiencyHome" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EfficiencyPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EfficiencyNomination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeId" TEXT,
    "nominatorId" TEXT NOT NULL,
    "communityId" TEXT,
    "nomineeAddress" TEXT NOT NULL,
    "nomineeCity" TEXT NOT NULL,
    "nomineeState" TEXT NOT NULL,
    "nomineeZipCode" TEXT NOT NULL,
    "nomineeReason" TEXT NOT NULL,
    "nomineeConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "votingEndsAt" DATETIME,
    "approvalVotes" INTEGER NOT NULL DEFAULT 0,
    "rejectionVotes" INTEGER NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EfficiencyNomination_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "EfficiencyHome" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EfficiencyNomination_nominatorId_fkey" FOREIGN KEY ("nominatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EfficiencyNomination_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NeighborhoodCascade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "centerLat" REAL,
    "centerLng" REAL,
    "radiusMiles" REAL NOT NULL DEFAULT 1.0,
    "homeCount" INTEGER NOT NULL DEFAULT 0,
    "minHomes" INTEGER NOT NULL DEFAULT 10,
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "targetPhase" INTEGER,
    "totalEstimatedCost" REAL NOT NULL DEFAULT 0,
    "bulkDiscount" REAL NOT NULL DEFAULT 0,
    "totalFunded" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'forming',
    "triggeredAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NeighborhoodCascade_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "category" TEXT,
    "imageUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 1,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'geographic',
    "parentId" TEXT,
    "level" TEXT,
    "slug" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "bounds" TEXT,
    CONSTRAINT "Community_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Community_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Community" ("category", "createdAt", "createdBy", "description", "id", "imageUrl", "location", "memberCount", "name", "updatedAt") SELECT "category", "createdAt", "createdBy", "description", "id", "imageUrl", "location", "memberCount", "name", "updatedAt" FROM "Community";
DROP TABLE "Community";
ALTER TABLE "new_Community" RENAME TO "Community";
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE INDEX "Community_parentId_idx" ON "Community"("parentId");
CREATE INDEX "Community_level_idx" ON "Community"("level");
CREATE INDEX "Community_type_idx" ON "Community"("type");
CREATE TABLE "new_Discussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Discussion_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Discussion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Discussion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Discussion" ("body", "communityId", "createdAt", "id", "title", "updatedAt", "userId") SELECT "body", "communityId", "createdAt", "id", "title", "updatedAt", "userId" FROM "Discussion";
DROP TABLE "Discussion";
ALTER TABLE "new_Discussion" RENAME TO "Discussion";
CREATE INDEX "Discussion_parentId_idx" ON "Discussion"("parentId");
CREATE TABLE "new_FlagshipProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "strategicPlanId" TEXT,
    "nominatingCommunityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "fundingSource" TEXT NOT NULL DEFAULT 'reserve',
    "votingEndsAt" DATETIME,
    "tabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlagshipProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlagshipProject_strategicPlanId_fkey" FOREIGN KEY ("strategicPlanId") REFERENCES "StrategicPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FlagshipProject_nominatingCommunityId_fkey" FOREIGN KEY ("nominatingCommunityId") REFERENCES "Community" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FlagshipProject" ("createdAt", "fundingSource", "id", "projectId", "status", "strategicPlanId", "tabledAt", "updatedAt", "votingEndsAt") SELECT "createdAt", "fundingSource", "id", "projectId", "status", "strategicPlanId", "tabledAt", "updatedAt", "votingEndsAt" FROM "FlagshipProject";
DROP TABLE "FlagshipProject";
ALTER TABLE "new_FlagshipProject" RENAME TO "FlagshipProject";
CREATE UNIQUE INDEX "FlagshipProject_projectId_key" ON "FlagshipProject"("projectId");
CREATE INDEX "FlagshipProject_strategicPlanId_idx" ON "FlagshipProject"("strategicPlanId");
CREATE INDEX "FlagshipProject_nominatingCommunityId_idx" ON "FlagshipProject"("nominatingCommunityId");
CREATE TABLE "new_Loan" (
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
    "recoveryStartedAt" DATETIME,
    "defaultedAt" DATETIME,
    "recoveryPayments" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "borrowerId", "createdAt", "fundingDeadline", "id", "latePayments", "location", "monthlyPayment", "purpose", "purposeCategory", "repaymentMonths", "seekingSponsor", "sharesRemaining", "sponsorshipAmount", "status", "story", "tier", "totalShares", "updatedAt") SELECT "amount", "borrowerId", "createdAt", "fundingDeadline", "id", "latePayments", "location", "monthlyPayment", "purpose", "purposeCategory", "repaymentMonths", "seekingSponsor", "sharesRemaining", "sponsorshipAmount", "status", "story", "tier", "totalShares", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
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
    "completedAt" DATETIME,
    "impactSummary" TEXT,
    "taxDeductible" BOOLEAN NOT NULL DEFAULT false,
    "ein" TEXT,
    "orgName" TEXT,
    "orgType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "momentumScore" REAL NOT NULL DEFAULT 0,
    "momentumUpdatedAt" DATETIME
);
INSERT INTO "new_Project" ("backerCount", "category", "createdAt", "description", "disbursedAmount", "disbursementStatus", "fundingGoal", "fundingRaised", "id", "imageUrl", "isFlagship", "location", "status", "title", "updatedAt") SELECT "backerCount", "category", "createdAt", "description", "disbursedAmount", "disbursementStatus", "fundingGoal", "fundingRaised", "id", "imageUrl", "isFlagship", "location", "status", "title", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentDays" INTEGER NOT NULL DEFAULT 0,
    "longestDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "gracePeriodUsed" BOOLEAN NOT NULL DEFAULT false,
    "graceExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Streak" ("createdAt", "currentDays", "id", "lastActiveDate", "longestDays", "type", "updatedAt", "userId") SELECT "createdAt", "currentDays", "id", "lastActiveDate", "longestDays", "type", "updatedAt", "userId" FROM "Streak";
DROP TABLE "Streak";
ALTER TABLE "new_Streak" RENAME TO "Streak";
CREATE UNIQUE INDEX "Streak_userId_type_key" ON "Streak"("userId", "type");
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
    "interests" TEXT,
    "lastLoginAt" DATETIME,
    "archivedAt" DATETIME,
    "profileVisibility" TEXT NOT NULL DEFAULT 'private',
    "bio" TEXT,
    "avatarUrl" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalVerifiedHours" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("accountType", "archivedAt", "createdAt", "creditLimit", "creditTier", "email", "id", "lastLoginAt", "lastTierUpdate", "name", "onboardingComplete", "passwordHash", "updatedAt") SELECT "accountType", "archivedAt", "createdAt", "creditLimit", "creditTier", "email", "id", "lastLoginAt", "lastTierUpdate", "name", "onboardingComplete", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserBadge" ("badgeId", "earnedAt", "id", "userId") SELECT "badgeId", "earnedAt", "id", "userId" FROM "UserBadge";
DROP TABLE "UserBadge";
ALTER TABLE "new_UserBadge" RENAME TO "UserBadge";
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
CREATE TABLE "new_Watershed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "totalInflow" REAL NOT NULL DEFAULT 0,
    "totalOutflow" REAL NOT NULL DEFAULT 0,
    "floatContributed" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Watershed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Watershed" ("balance", "createdAt", "id", "totalInflow", "totalOutflow", "updatedAt", "userId") SELECT "balance", "createdAt", "id", "totalInflow", "totalOutflow", "updatedAt", "userId" FROM "Watershed";
DROP TABLE "Watershed";
ALTER TABLE "new_Watershed" RENAME TO "Watershed";
CREATE UNIQUE INDEX "Watershed_userId_key" ON "Watershed"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LoanStretchGoal_loanId_priority_key" ON "LoanStretchGoal"("loanId", "priority");

-- CreateIndex
CREATE INDEX "LoanQuestion_loanId_idx" ON "LoanQuestion"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "GoalVerification_loanId_key" ON "GoalVerification"("loanId");

-- CreateIndex
CREATE INDEX "LoanDeadlineExtension_loanId_idx" ON "LoanDeadlineExtension"("loanId");

-- CreateIndex
CREATE INDEX "BadgeProgress_userId_idx" ON "BadgeProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BadgeProgress_userId_badgeKey_key" ON "BadgeProgress"("userId", "badgeKey");

-- CreateIndex
CREATE INDEX "ProjectUpdate_projectId_createdAt_idx" ON "ProjectUpdate"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ImpactMetric_projectId_idx" ON "ImpactMetric"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFollow_userId_projectId_key" ON "ProjectFollow"("userId", "projectId");

-- CreateIndex
CREATE INDEX "Rally_projectId_status_idx" ON "Rally"("projectId", "status");

-- CreateIndex
CREATE INDEX "Rally_deadline_idx" ON "Rally"("deadline");

-- CreateIndex
CREATE UNIQUE INDEX "RallyParticipant_rallyId_userId_key" ON "RallyParticipant"("rallyId", "userId");

-- CreateIndex
CREATE INDEX "ShareEvent_projectId_createdAt_idx" ON "ShareEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityFeedItem_subjectType_subjectId_idx" ON "ActivityFeedItem"("subjectType", "subjectId");

-- CreateIndex
CREATE INDEX "ActivityFeedItem_createdAt_idx" ON "ActivityFeedItem"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "BusinessListing_category_idx" ON "BusinessListing"("category");

-- CreateIndex
CREATE INDEX "BusinessListing_location_idx" ON "BusinessListing"("location");

-- CreateIndex
CREATE INDEX "BusinessView_listingId_idx" ON "BusinessView"("listingId");

-- CreateIndex
CREATE INDEX "BusinessView_viewerId_createdAt_idx" ON "BusinessView"("viewerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedBusiness_userId_listingId_key" ON "SavedBusiness"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessRecommendation_userId_listingId_key" ON "BusinessRecommendation"("userId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityGrant_projectId_key" ON "CommunityGrant"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityGrantVolunteer_grantId_userId_key" ON "CommunityGrantVolunteer"("grantId", "userId");

-- CreateIndex
CREATE INDEX "CommunityGoal_communityId_status_idx" ON "CommunityGoal"("communityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMilestone_communityId_type_key" ON "CommunityMilestone"("communityId", "type");

-- CreateIndex
CREATE INDEX "CommunityEvent_communityId_date_idx" ON "CommunityEvent"("communityId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_eventId_userId_key" ON "EventRSVP"("eventId", "userId");

-- CreateIndex
CREATE INDEX "CommunityChallenge_status_startDate_idx" ON "CommunityChallenge"("status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeEntry_challengeId_communityId_key" ON "ChallengeEntry"("challengeId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectProposal_projectId_key" ON "ProjectProposal"("projectId");

-- CreateIndex
CREATE INDEX "ProjectProposal_proposerId_idx" ON "ProjectProposal"("proposerId");

-- CreateIndex
CREATE INDEX "ProjectProposal_status_idx" ON "ProjectProposal"("status");

-- CreateIndex
CREATE INDEX "UserFollow_followerId_idx" ON "UserFollow"("followerId");

-- CreateIndex
CREATE INDEX "UserFollow_followeeId_idx" ON "UserFollow"("followeeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_followerId_followeeId_key" ON "UserFollow"("followerId", "followeeId");

-- CreateIndex
CREATE INDEX "CommunityFollow_userId_idx" ON "CommunityFollow"("userId");

-- CreateIndex
CREATE INDEX "CommunityFollow_communityId_idx" ON "CommunityFollow"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityFollow_userId_communityId_key" ON "CommunityFollow"("userId", "communityId");

-- CreateIndex
CREATE INDEX "FeedItem_userId_createdAt_idx" ON "FeedItem"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedItem_userId_read_idx" ON "FeedItem"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionMention_discussionId_userId_key" ON "DiscussionMention"("discussionId", "userId");

-- CreateIndex
CREATE INDEX "CascadeSponsor_status_startDate_idx" ON "CascadeSponsor"("status", "startDate");

-- CreateIndex
CREATE INDEX "CascadeSponsorEvent_sponsorId_idx" ON "CascadeSponsorEvent"("sponsorId");

-- CreateIndex
CREATE INDEX "NotificationSponsor_status_idx" ON "NotificationSponsor"("status");

-- CreateIndex
CREATE INDEX "NotificationSponsorEvent_sponsorId_idx" ON "NotificationSponsorEvent"("sponsorId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FloatSnapshot_date_key" ON "FloatSnapshot"("date");

-- CreateIndex
CREATE INDEX "FloatSnapshot_date_idx" ON "FloatSnapshot"("date");

-- CreateIndex
CREATE INDEX "RevenueRecord_date_source_idx" ON "RevenueRecord"("date", "source");

-- CreateIndex
CREATE INDEX "CostRecord_date_category_idx" ON "CostRecord"("date", "category");

-- CreateIndex
CREATE UNIQUE INDEX "TransparencyReport_period_periodType_key" ON "TransparencyReport"("period", "periodType");

-- CreateIndex
CREATE INDEX "Family_sharedWatershedId_idx" ON "Family"("sharedWatershedId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_userId_key" ON "FamilyMember"("userId");

-- CreateIndex
CREATE INDEX "FamilyMember_familyId_idx" ON "FamilyMember"("familyId");

-- CreateIndex
CREATE INDEX "FamilyGoal_familyId_status_idx" ON "FamilyGoal"("familyId", "status");

-- CreateIndex
CREATE INDEX "FamilyActivity_familyId_createdAt_idx" ON "FamilyActivity"("familyId", "createdAt");

-- CreateIndex
CREATE INDEX "PendingFamilyAction_familyId_status_idx" ON "PendingFamilyAction"("familyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyBadge_slug_key" ON "FamilyBadge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyBadgeEarned_familyId_badgeId_key" ON "FamilyBadgeEarned"("familyId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvite_token_key" ON "FamilyInvite"("token");

-- CreateIndex
CREATE INDEX "FamilyInvite_token_idx" ON "FamilyInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionReceipt_receiptNumber_key" ON "ContributionReceipt"("receiptNumber");

-- CreateIndex
CREATE INDEX "ContributionReceipt_userId_date_idx" ON "ContributionReceipt"("userId", "date");

-- CreateIndex
CREATE INDEX "ContributionReceipt_receiptNumber_idx" ON "ContributionReceipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualGivingSummary_userId_year_key" ON "AnnualGivingSummary"("userId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyAnnualSummary_familyId_year_key" ON "FamilyAnnualSummary"("familyId", "year");

-- CreateIndex
CREATE INDEX "RecurringContribution_userId_status_idx" ON "RecurringContribution"("userId", "status");

-- CreateIndex
CREATE INDEX "RecurringContribution_nextChargeDate_status_idx" ON "RecurringContribution"("nextChargeDate", "status");

-- CreateIndex
CREATE INDEX "RecurringContributionHistory_recurringContributionId_chargeDate_idx" ON "RecurringContributionHistory"("recurringContributionId", "chargeDate");

-- CreateIndex
CREATE INDEX "ProjectSubscription_nextChargeDate_status_idx" ON "ProjectSubscription"("nextChargeDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubscription_userId_projectId_key" ON "ProjectSubscription"("userId", "projectId");

-- CreateIndex
CREATE INDEX "CommunitySubscription_nextChargeDate_status_idx" ON "CommunitySubscription"("nextChargeDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CommunitySubscription_userId_communityId_key" ON "CommunitySubscription"("userId", "communityId");

-- CreateIndex
CREATE INDEX "PersonalGivingGoal_userId_status_idx" ON "PersonalGivingGoal"("userId", "status");

-- CreateIndex
CREATE INDEX "PersonalGivingGoal_periodEnd_status_idx" ON "PersonalGivingGoal"("periodEnd", "status");

-- CreateIndex
CREATE INDEX "VolunteerOpportunity_projectId_status_idx" ON "VolunteerOpportunity"("projectId", "status");

-- CreateIndex
CREATE INDEX "VolunteerOpportunity_status_startDate_idx" ON "VolunteerOpportunity"("status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerSignup_opportunityId_userId_key" ON "VolunteerSignup"("opportunityId", "userId");

-- CreateIndex
CREATE INDEX "VolunteerLog_userId_date_idx" ON "VolunteerLog"("userId", "date");

-- CreateIndex
CREATE INDEX "VolunteerLog_opportunityId_idx" ON "VolunteerLog"("opportunityId");

-- CreateIndex
CREATE INDEX "UserSkill_skill_idx" ON "UserSkill"("skill");

-- CreateIndex
CREATE INDEX "UserSkill_category_idx" ON "UserSkill"("category");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skill_key" ON "UserSkill"("userId", "skill");

-- CreateIndex
CREATE INDEX "InKindDonation_projectId_status_idx" ON "InKindDonation"("projectId", "status");

-- CreateIndex
CREATE INDEX "InKindDonation_userId_idx" ON "InKindDonation"("userId");

-- CreateIndex
CREATE INDEX "ProjectNeed_projectId_fulfilled_idx" ON "ProjectNeed"("projectId", "fulfilled");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateAccount_slug_key" ON "CorporateAccount"("slug");

-- CreateIndex
CREATE INDEX "CorporateAccount_status_idx" ON "CorporateAccount"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateEmployee_userId_key" ON "CorporateEmployee"("userId");

-- CreateIndex
CREATE INDEX "CorporateEmployee_corporateAccountId_status_idx" ON "CorporateEmployee"("corporateAccountId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateEmployee_corporateAccountId_employeeId_key" ON "CorporateEmployee"("corporateAccountId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateInvite_token_key" ON "CorporateInvite"("token");

-- CreateIndex
CREATE INDEX "CorporateInvite_corporateAccountId_idx" ON "CorporateInvite"("corporateAccountId");

-- CreateIndex
CREATE INDEX "CorporateInvite_token_idx" ON "CorporateInvite"("token");

-- CreateIndex
CREATE INDEX "CorporateMatchingRecord_corporateAccountId_matchDate_idx" ON "CorporateMatchingRecord"("corporateAccountId", "matchDate");

-- CreateIndex
CREATE INDEX "CorporateMatchingRecord_userId_idx" ON "CorporateMatchingRecord"("userId");

-- CreateIndex
CREATE INDEX "CorporateCampaign_corporateAccountId_status_idx" ON "CorporateCampaign"("corporateAccountId", "status");

-- CreateIndex
CREATE INDEX "CorporateCampaign_status_startDate_idx" ON "CorporateCampaign"("status", "startDate");

-- CreateIndex
CREATE INDEX "CorporateReport_corporateAccountId_type_idx" ON "CorporateReport"("corporateAccountId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "GivingCircle_slug_key" ON "GivingCircle"("slug");

-- CreateIndex
CREATE INDEX "GivingCircle_status_idx" ON "GivingCircle"("status");

-- CreateIndex
CREATE INDEX "CircleMember_userId_idx" ON "CircleMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CircleMember_circleId_userId_key" ON "CircleMember"("circleId", "userId");

-- CreateIndex
CREATE INDEX "CircleContribution_circleId_createdAt_idx" ON "CircleContribution"("circleId", "createdAt");

-- CreateIndex
CREATE INDEX "CircleContribution_userId_idx" ON "CircleContribution"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CircleInvite_token_key" ON "CircleInvite"("token");

-- CreateIndex
CREATE INDEX "CircleInvite_circleId_idx" ON "CircleInvite"("circleId");

-- CreateIndex
CREATE INDEX "CircleInvite_token_idx" ON "CircleInvite"("token");

-- CreateIndex
CREATE INDEX "CircleProposal_circleId_status_idx" ON "CircleProposal"("circleId", "status");

-- CreateIndex
CREATE INDEX "CircleProposal_votingEnds_idx" ON "CircleProposal"("votingEnds");

-- CreateIndex
CREATE UNIQUE INDEX "CircleVote_proposalId_userId_key" ON "CircleVote"("proposalId", "userId");

-- CreateIndex
CREATE INDEX "CircleActivity_circleId_createdAt_idx" ON "CircleActivity"("circleId", "createdAt");

-- CreateIndex
CREATE INDEX "CircleDiscussion_circleId_createdAt_idx" ON "CircleDiscussion"("circleId", "createdAt");

-- CreateIndex
CREATE INDEX "CircleDiscussion_parentId_idx" ON "CircleDiscussion"("parentId");

-- CreateIndex
CREATE INDEX "CircleRecurring_nextChargeDate_status_idx" ON "CircleRecurring"("nextChargeDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CircleRecurring_circleId_userId_key" ON "CircleRecurring"("circleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GivingOccasion_slug_key" ON "GivingOccasion"("slug");

-- CreateIndex
CREATE INDEX "GivingOccasion_status_startDate_idx" ON "GivingOccasion"("status", "startDate");

-- CreateIndex
CREATE INDEX "GivingOccasion_type_idx" ON "GivingOccasion"("type");

-- CreateIndex
CREATE INDEX "GiftContribution_contributorId_idx" ON "GiftContribution"("contributorId");

-- CreateIndex
CREATE INDEX "GiftContribution_notificationDate_idx" ON "GiftContribution"("notificationDate");

-- CreateIndex
CREATE UNIQUE INDEX "BirthdayFundraiser_shareUrl_key" ON "BirthdayFundraiser"("shareUrl");

-- CreateIndex
CREATE INDEX "BirthdayFundraiser_userId_idx" ON "BirthdayFundraiser"("userId");

-- CreateIndex
CREATE INDEX "BirthdayFundraiser_birthdayDate_idx" ON "BirthdayFundraiser"("birthdayDate");

-- CreateIndex
CREATE INDEX "BirthdayFundraiser_shareUrl_idx" ON "BirthdayFundraiser"("shareUrl");

-- CreateIndex
CREATE INDEX "BirthdayFundraiser_status_idx" ON "BirthdayFundraiser"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCampaign_slug_key" ON "EmergencyCampaign"("slug");

-- CreateIndex
CREATE INDEX "EmergencyCampaign_status_idx" ON "EmergencyCampaign"("status");

-- CreateIndex
CREATE INDEX "EmergencyCampaign_priority_idx" ON "EmergencyCampaign"("priority");

-- CreateIndex
CREATE INDEX "EmergencyUpdate_campaignId_createdAt_idx" ON "EmergencyUpdate"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "ScheduledGift_userId_scheduledDate_idx" ON "ScheduledGift"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "ScheduledGift_scheduledDate_status_idx" ON "ScheduledGift"("scheduledDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalCampaign_slug_key" ON "SeasonalCampaign"("slug");

-- CreateIndex
CREATE INDEX "SeasonalCampaign_status_startDate_idx" ON "SeasonalCampaign"("status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "CreditReportingConsent_loanId_key" ON "CreditReportingConsent"("loanId");

-- CreateIndex
CREATE INDEX "CreditReportingConsent_userId_idx" ON "CreditReportingConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditReportingStatus_loanId_key" ON "CreditReportingStatus"("loanId");

-- CreateIndex
CREATE INDEX "Metro2Record_loanId_reportingPeriod_idx" ON "Metro2Record"("loanId", "reportingPeriod");

-- CreateIndex
CREATE INDEX "Metro2Record_submitted_reportingPeriod_idx" ON "Metro2Record"("submitted", "reportingPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "BureauConnection_bureau_key" ON "BureauConnection"("bureau");

-- CreateIndex
CREATE INDEX "BureauSubmission_bureau_reportingPeriod_idx" ON "BureauSubmission"("bureau", "reportingPeriod");

-- CreateIndex
CREATE INDEX "BureauSubmission_status_idx" ON "BureauSubmission"("status");

-- CreateIndex
CREATE INDEX "CreditDispute_status_dueDate_idx" ON "CreditDispute"("status", "dueDate");

-- CreateIndex
CREATE INDEX "CreditDispute_loanId_idx" ON "CreditDispute"("loanId");

-- CreateIndex
CREATE INDEX "CreditDispute_userId_idx" ON "CreditDispute"("userId");

-- CreateIndex
CREATE INDEX "CreditDisputeNote_disputeId_idx" ON "CreditDisputeNote"("disputeId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityAdvocate_userId_key" ON "CommunityAdvocate"("userId");

-- CreateIndex
CREATE INDEX "CommunityAdvocate_status_idx" ON "CommunityAdvocate"("status");

-- CreateIndex
CREATE INDEX "CommunityAdvocate_region_idx" ON "CommunityAdvocate"("region");

-- CreateIndex
CREATE UNIQUE INDEX "AdvocateInterest_userId_key" ON "AdvocateInterest"("userId");

-- CreateIndex
CREATE INDEX "AdvocateInterest_status_idx" ON "AdvocateInterest"("status");

-- CreateIndex
CREATE INDEX "AdvocateActivity_advocateId_type_idx" ON "AdvocateActivity"("advocateId", "type");

-- CreateIndex
CREATE INDEX "AdvocateActivity_createdAt_idx" ON "AdvocateActivity"("createdAt");

-- CreateIndex
CREATE INDEX "AdvocateEvent_advocateId_date_idx" ON "AdvocateEvent"("advocateId", "date");

-- CreateIndex
CREATE INDEX "AdvocateEvent_communityId_date_idx" ON "AdvocateEvent"("communityId", "date");

-- CreateIndex
CREATE INDEX "AdvocateEvent_date_idx" ON "AdvocateEvent"("date");

-- CreateIndex
CREATE INDEX "AdvocateEventRSVP_eventId_idx" ON "AdvocateEventRSVP"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvocateEventRSVP_eventId_userId_key" ON "AdvocateEventRSVP"("eventId", "userId");

-- CreateIndex
CREATE INDEX "AdvocateResource_category_type_idx" ON "AdvocateResource"("category", "type");

-- CreateIndex
CREATE INDEX "AdvocateAppreciation_advocateId_idx" ON "AdvocateAppreciation"("advocateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVerification_projectId_key" ON "ProjectVerification"("projectId");

-- CreateIndex
CREATE INDEX "VerificationCheck_verificationId_checkType_idx" ON "VerificationCheck"("verificationId", "checkType");

-- CreateIndex
CREATE INDEX "VerificationCheck_status_idx" ON "VerificationCheck"("status");

-- CreateIndex
CREATE INDEX "IdentityVerification_userId_status_idx" ON "IdentityVerification"("userId", "status");

-- CreateIndex
CREATE INDEX "OrganizationVerification_ein_idx" ON "OrganizationVerification"("ein");

-- CreateIndex
CREATE INDEX "OrganizationVerification_verificationStatus_idx" ON "OrganizationVerification"("verificationStatus");

-- CreateIndex
CREATE INDEX "OrganizationVerification_projectId_idx" ON "OrganizationVerification"("projectId");

-- CreateIndex
CREATE INDEX "OutcomeVerification_projectId_status_idx" ON "OutcomeVerification"("projectId", "status");

-- CreateIndex
CREATE INDEX "CommunityVerification_outcomeId_idx" ON "CommunityVerification"("outcomeId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityVerification_outcomeId_userId_key" ON "CommunityVerification"("outcomeId", "userId");

-- CreateIndex
CREATE INDEX "ProjectAudit_verificationId_idx" ON "ProjectAudit"("verificationId");

-- CreateIndex
CREATE INDEX "ProjectAudit_status_idx" ON "ProjectAudit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Auditor_userId_key" ON "Auditor"("userId");

-- CreateIndex
CREATE INDEX "Auditor_status_idx" ON "Auditor"("status");

-- CreateIndex
CREATE INDEX "ProjectFlag_projectId_status_idx" ON "ProjectFlag"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectFlag_severity_status_idx" ON "ProjectFlag"("severity", "status");

-- CreateIndex
CREATE INDEX "ProjectFlag_type_idx" ON "ProjectFlag"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_status_idx" ON "ApiKey"("userId", "status");

-- CreateIndex
CREATE INDEX "ApiRequestLog_apiKeyId_createdAt_idx" ON "ApiRequestLog"("apiKeyId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiRequestLog_endpoint_createdAt_idx" ON "ApiRequestLog"("endpoint", "createdAt");

-- CreateIndex
CREATE INDEX "Webhook_userId_status_idx" ON "Webhook"("userId", "status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_createdAt_idx" ON "WebhookDelivery"("webhookId", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_nextRetry_idx" ON "WebhookDelivery"("status", "nextRetry");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthApp_clientId_key" ON "OAuthApp"("clientId");

-- CreateIndex
CREATE INDEX "OAuthApp_clientId_idx" ON "OAuthApp"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAuthorization_authCode_key" ON "OAuthAuthorization"("authCode");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAuthorization_accessToken_key" ON "OAuthAuthorization"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAuthorization_refreshToken_key" ON "OAuthAuthorization"("refreshToken");

-- CreateIndex
CREATE INDEX "OAuthAuthorization_accessToken_idx" ON "OAuthAuthorization"("accessToken");

-- CreateIndex
CREATE INDEX "OAuthAuthorization_authCode_idx" ON "OAuthAuthorization"("authCode");

-- CreateIndex
CREATE INDEX "OAuthAuthorization_userId_appId_idx" ON "OAuthAuthorization"("userId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterestProfile_userId_key" ON "UserInterestProfile"("userId");

-- CreateIndex
CREATE INDEX "UserInteraction_userId_entityType_createdAt_idx" ON "UserInteraction"("userId", "entityType", "createdAt");

-- CreateIndex
CREATE INDEX "UserInteraction_entityId_action_idx" ON "UserInteraction"("entityId", "action");

-- CreateIndex
CREATE INDEX "UserSimilarity_userId_score_idx" ON "UserSimilarity"("userId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "UserSimilarity_userId_similarUserId_basis_key" ON "UserSimilarity"("userId", "similarUserId", "basis");

-- CreateIndex
CREATE INDEX "ProjectSimilarity_projectId_score_idx" ON "ProjectSimilarity"("projectId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSimilarity_projectId_similarProjectId_key" ON "ProjectSimilarity"("projectId", "similarProjectId");

-- CreateIndex
CREATE INDEX "Recommendation_userId_entityType_score_idx" ON "Recommendation"("userId", "entityType", "score");

-- CreateIndex
CREATE INDEX "Recommendation_expiresAt_idx" ON "Recommendation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_entityType_entityId_key" ON "Recommendation"("userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "MatchScore_userId_score_idx" ON "MatchScore"("userId", "score");

-- CreateIndex
CREATE INDEX "MatchScore_projectId_score_idx" ON "MatchScore"("projectId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_userId_projectId_key" ON "MatchScore"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "DigestPreferences_userId_key" ON "DigestPreferences"("userId");

-- CreateIndex
CREATE INDEX "DiscoveryChallenge_userId_status_idx" ON "DiscoveryChallenge"("userId", "status");

-- CreateIndex
CREATE INDEX "RecommendationMetrics_date_idx" ON "RecommendationMetrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationMetrics_date_algorithm_entityType_key" ON "RecommendationMetrics"("date", "algorithm", "entityType");

-- CreateIndex
CREATE UNIQUE INDEX "LearningResource_slug_key" ON "LearningResource"("slug");

-- CreateIndex
CREATE INDEX "LearningResource_category_isPublished_idx" ON "LearningResource"("category", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "GivingPlan_userId_key" ON "GivingPlan"("userId");

-- CreateIndex
CREATE INDEX "ReflectionEntry_userId_createdAt_idx" ON "ReflectionEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GivingScenario_category_idx" ON "GivingScenario"("category");

-- CreateIndex
CREATE INDEX "LearningDiscussion_resourceId_createdAt_idx" ON "LearningDiscussion"("resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "LearningReply_discussionId_createdAt_idx" ON "LearningReply"("discussionId", "createdAt");

-- CreateIndex
CREATE INDEX "StudyCircle_topic_idx" ON "StudyCircle"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "StudyCircleMember_circleId_userId_key" ON "StudyCircleMember"("circleId", "userId");

-- CreateIndex
CREATE INDEX "LearningCertificate_userId_idx" ON "LearningCertificate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_customDomain_key" ON "Institution"("customDomain");

-- CreateIndex
CREATE INDEX "Institution_status_idx" ON "Institution"("status");

-- CreateIndex
CREATE INDEX "Institution_customDomain_idx" ON "Institution"("customDomain");

-- CreateIndex
CREATE INDEX "InstitutionAdmin_userId_idx" ON "InstitutionAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionAdmin_institutionId_userId_key" ON "InstitutionAdmin"("institutionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionSettings_institutionId_key" ON "InstitutionSettings"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionPage_institutionId_isPublished_idx" ON "InstitutionPage"("institutionId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionPage_institutionId_slug_key" ON "InstitutionPage"("institutionId", "slug");

-- CreateIndex
CREATE INDEX "InstitutionReport_institutionId_idx" ON "InstitutionReport"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionReport_institutionId_type_period_key" ON "InstitutionReport"("institutionId", "type", "period");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionSSO_institutionId_key" ON "InstitutionSSO"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversitySettings_institutionId_key" ON "UniversitySettings"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "CitySettings_institutionId_key" ON "CitySettings"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "FoundationSettings_institutionId_key" ON "FoundationSettings"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_userId_key" ON "Mentor"("userId");

-- CreateIndex
CREATE INDEX "Mentor_status_isAccepting_idx" ON "Mentor"("status", "isAccepting");

-- CreateIndex
CREATE UNIQUE INDEX "Mentee_userId_key" ON "Mentee"("userId");

-- CreateIndex
CREATE INDEX "Mentee_status_idx" ON "Mentee"("status");

-- CreateIndex
CREATE INDEX "Mentorship_mentorId_status_idx" ON "Mentorship"("mentorId", "status");

-- CreateIndex
CREATE INDEX "Mentorship_menteeId_status_idx" ON "Mentorship"("menteeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Mentorship_mentorId_menteeId_key" ON "Mentorship"("mentorId", "menteeId");

-- CreateIndex
CREATE INDEX "MentorMessage_mentorshipId_createdAt_idx" ON "MentorMessage"("mentorshipId", "createdAt");

-- CreateIndex
CREATE INDEX "MentorSession_mentorId_scheduledAt_idx" ON "MentorSession"("mentorId", "scheduledAt");

-- CreateIndex
CREATE INDEX "MentorSession_mentorshipId_idx" ON "MentorSession"("mentorshipId");

-- CreateIndex
CREATE INDEX "MentorReview_mentorId_idx" ON "MentorReview"("mentorId");

-- CreateIndex
CREATE INDEX "MenteeGoal_mentorshipId_status_idx" ON "MenteeGoal"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "MenteeMilestone_goalId_idx" ON "MenteeMilestone"("goalId");

-- CreateIndex
CREATE INDEX "SupportGroup_type_status_idx" ON "SupportGroup"("type", "status");

-- CreateIndex
CREATE INDEX "SupportGroupMember_userId_idx" ON "SupportGroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportGroupMember_groupId_userId_key" ON "SupportGroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "SupportGroupMeeting_groupId_scheduledAt_idx" ON "SupportGroupMeeting"("groupId", "scheduledAt");

-- CreateIndex
CREATE INDEX "SupportGroupPost_groupId_createdAt_idx" ON "SupportGroupPost"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportGroupReply_postId_idx" ON "SupportGroupReply"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactStory_slug_key" ON "ImpactStory"("slug");

-- CreateIndex
CREATE INDEX "ImpactStory_type_status_idx" ON "ImpactStory"("type", "status");

-- CreateIndex
CREATE INDEX "ImpactStory_isFeatured_idx" ON "ImpactStory"("isFeatured");

-- CreateIndex
CREATE INDEX "ImpactStory_projectId_idx" ON "ImpactStory"("projectId");

-- CreateIndex
CREATE INDEX "ImpactStory_communityId_idx" ON "ImpactStory"("communityId");

-- CreateIndex
CREATE INDEX "StoryPrompt_trigger_isActive_idx" ON "StoryPrompt"("trigger", "isActive");

-- CreateIndex
CREATE INDEX "Testimonial_type_isPublished_idx" ON "Testimonial"("type", "isPublished");

-- CreateIndex
CREATE INDEX "Testimonial_isFeatured_idx" ON "Testimonial"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformImpact_metric_key" ON "PlatformImpact"("metric");

-- CreateIndex
CREATE INDEX "BeforeAfter_projectId_idx" ON "BeforeAfter"("projectId");

-- CreateIndex
CREATE INDEX "StoryView_storyId_createdAt_idx" ON "StoryView"("storyId", "createdAt");

-- CreateIndex
CREATE INDEX "StoryShare_storyId_platform_idx" ON "StoryShare"("storyId", "platform");

-- CreateIndex
CREATE INDEX "StoryCampaign_status_startDate_idx" ON "StoryCampaign"("status", "startDate");

-- CreateIndex
CREATE INDEX "Translation_locale_namespace_idx" ON "Translation"("locale", "namespace");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_locale_namespace_key_key" ON "Translation"("locale", "namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocale_userId_key" ON "UserLocale"("userId");

-- CreateIndex
CREATE INDEX "ContentTranslation_entityType_entityId_idx" ON "ContentTranslation"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentTranslation_entityType_entityId_field_locale_key" ON "ContentTranslation"("entityType", "entityId", "field", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "AccessibilityPreferences_userId_key" ON "AccessibilityPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantProgram_slug_key" ON "GrantProgram"("slug");

-- CreateIndex
CREATE INDEX "GrantProgram_status_applicationEnd_idx" ON "GrantProgram"("status", "applicationEnd");

-- CreateIndex
CREATE INDEX "GrantProgram_funderId_idx" ON "GrantProgram"("funderId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantReviewer_programId_userId_key" ON "GrantReviewer"("programId", "userId");

-- CreateIndex
CREATE INDEX "GrantApplication_programId_status_idx" ON "GrantApplication"("programId", "status");

-- CreateIndex
CREATE INDEX "GrantApplication_applicantId_idx" ON "GrantApplication"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantApplication_programId_applicantId_key" ON "GrantApplication"("programId", "applicantId");

-- CreateIndex
CREATE INDEX "GrantQuestion_programId_order_idx" ON "GrantQuestion"("programId", "order");

-- CreateIndex
CREATE INDEX "GrantReview_applicationId_idx" ON "GrantReview"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantReview_applicationId_reviewerId_key" ON "GrantReview"("applicationId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantRubric_programId_key" ON "GrantRubric"("programId");

-- CreateIndex
CREATE INDEX "GrantFeedback_applicationId_idx" ON "GrantFeedback"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "GrantAward_applicationId_key" ON "GrantAward"("applicationId");

-- CreateIndex
CREATE INDEX "GrantAward_programId_status_idx" ON "GrantAward"("programId", "status");

-- CreateIndex
CREATE INDEX "GrantAward_recipientId_idx" ON "GrantAward"("recipientId");

-- CreateIndex
CREATE INDEX "GrantDisbursement_awardId_status_idx" ON "GrantDisbursement"("awardId", "status");

-- CreateIndex
CREATE INDEX "GrantReport_awardId_type_idx" ON "GrantReport"("awardId", "type");

-- CreateIndex
CREATE INDEX "GrantReport_programId_status_idx" ON "GrantReport"("programId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GrantReportTemplate_programId_type_key" ON "GrantReportTemplate"("programId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "TransparencyRecord_hash_key" ON "TransparencyRecord"("hash");

-- CreateIndex
CREATE INDEX "TransparencyRecord_entityType_entityId_idx" ON "TransparencyRecord"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "TransparencyRecord_anchorStatus_idx" ON "TransparencyRecord"("anchorStatus");

-- CreateIndex
CREATE INDEX "TransparencyRecord_hash_idx" ON "TransparencyRecord"("hash");

-- CreateIndex
CREATE INDEX "TransparencyRecord_createdAt_idx" ON "TransparencyRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TransparencyAnchor_txHash_key" ON "TransparencyAnchor"("txHash");

-- CreateIndex
CREATE INDEX "TransparencyAnchor_chain_status_idx" ON "TransparencyAnchor"("chain", "status");

-- CreateIndex
CREATE INDEX "TransparencyAnchor_createdAt_idx" ON "TransparencyAnchor"("createdAt");

-- CreateIndex
CREATE INDEX "TransparencyProof_recordId_idx" ON "TransparencyProof"("recordId");

-- CreateIndex
CREATE INDEX "TransparencyProof_rootHash_idx" ON "TransparencyProof"("rootHash");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactCertificate_certificateHash_key" ON "ImpactCertificate"("certificateHash");

-- CreateIndex
CREATE INDEX "ImpactCertificate_userId_idx" ON "ImpactCertificate"("userId");

-- CreateIndex
CREATE INDEX "ImpactCertificate_certificateHash_idx" ON "ImpactCertificate"("certificateHash");

-- CreateIndex
CREATE INDEX "ImpactCertificate_entityType_entityId_idx" ON "ImpactCertificate"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "OrganizationLedger_organizationType_idx" ON "OrganizationLedger"("organizationType");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationLedger_organizationId_organizationType_key" ON "OrganizationLedger"("organizationId", "organizationType");

-- CreateIndex
CREATE INDEX "LedgerEntry_ledgerId_createdAt_idx" ON "LedgerEntry"("ledgerId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentFlag_contentType_contentId_idx" ON "ContentFlag"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "ContentFlag_status_flagType_idx" ON "ContentFlag"("status", "flagType");

-- CreateIndex
CREATE INDEX "ContentFlag_createdAt_idx" ON "ContentFlag"("createdAt");

-- CreateIndex
CREATE INDEX "SearchEmbedding_entityType_idx" ON "SearchEmbedding"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "SearchEmbedding_entityType_entityId_key" ON "SearchEmbedding"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPrediction_projectId_key" ON "ProjectPrediction"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPrediction_successProb_idx" ON "ProjectPrediction"("successProb");

-- CreateIndex
CREATE INDEX "AIAssistanceLog_userId_assistType_idx" ON "AIAssistanceLog"("userId", "assistType");

-- CreateIndex
CREATE INDEX "AIAssistanceLog_createdAt_idx" ON "AIAssistanceLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIConversation_userId_status_idx" ON "AIConversation"("userId", "status");

-- CreateIndex
CREATE INDEX "AIConversation_context_idx" ON "AIConversation"("context");

-- CreateIndex
CREATE INDEX "TrendAnalysis_trendType_period_idx" ON "TrendAnalysis"("trendType", "period");

-- CreateIndex
CREATE UNIQUE INDEX "TrendAnalysis_trendType_identifier_period_periodStart_key" ON "TrendAnalysis"("trendType", "identifier", "period", "periodStart");

-- CreateIndex
CREATE INDEX "CommunityWish_communityId_status_idx" ON "CommunityWish"("communityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PledgeCampaign_slug_key" ON "PledgeCampaign"("slug");

-- CreateIndex
CREATE INDEX "PledgeCampaign_status_endDate_idx" ON "PledgeCampaign"("status", "endDate");

-- CreateIndex
CREATE INDEX "PledgeCampaign_projectId_idx" ON "PledgeCampaign"("projectId");

-- CreateIndex
CREATE INDEX "PledgeCampaign_creatorId_idx" ON "PledgeCampaign"("creatorId");

-- CreateIndex
CREATE INDEX "Pledge_campaignId_status_idx" ON "Pledge"("campaignId", "status");

-- CreateIndex
CREATE INDEX "Pledge_userId_status_idx" ON "Pledge"("userId", "status");

-- CreateIndex
CREATE INDEX "CampaignReward_campaignId_amount_idx" ON "CampaignReward"("campaignId", "amount");

-- CreateIndex
CREATE UNIQUE INDEX "RewardFulfillment_pledgeId_key" ON "RewardFulfillment"("pledgeId");

-- CreateIndex
CREATE INDEX "RewardFulfillment_rewardId_status_idx" ON "RewardFulfillment"("rewardId", "status");

-- CreateIndex
CREATE INDEX "CampaignUpdate_campaignId_createdAt_idx" ON "CampaignUpdate"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignComment_campaignId_createdAt_idx" ON "CampaignComment"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignComment_parentId_idx" ON "CampaignComment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_code_idx" ON "GiftCard"("code");

-- CreateIndex
CREATE INDEX "GiftCard_recipientEmail_idx" ON "GiftCard"("recipientEmail");

-- CreateIndex
CREATE INDEX "GiftCard_purchaserId_idx" ON "GiftCard"("purchaserId");

-- CreateIndex
CREATE INDEX "GiftCard_status_idx" ON "GiftCard"("status");

-- CreateIndex
CREATE INDEX "GiftCardDesign_category_isActive_idx" ON "GiftCardDesign"("category", "isActive");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_giftCardId_createdAt_idx" ON "GiftCardTransaction"("giftCardId", "createdAt");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_userId_idx" ON "GiftCardTransaction"("userId");

-- CreateIndex
CREATE INDEX "GiftCardOrder_purchaserId_idx" ON "GiftCardOrder"("purchaserId");

-- CreateIndex
CREATE INDEX "GiftCardOrder_status_idx" ON "GiftCardOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalCardOrder_orderId_key" ON "PhysicalCardOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreCredit_userId_key" ON "StoreCredit"("userId");

-- CreateIndex
CREATE INDEX "StoreCreditTransaction_creditId_createdAt_idx" ON "StoreCreditTransaction"("creditId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_isActive_idx" ON "PromoCode"("code", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeUsage_promoCodeId_userId_orderId_key" ON "PromoCodeUsage"("promoCodeId", "userId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "NonprofitOrganization_slug_key" ON "NonprofitOrganization"("slug");

-- CreateIndex
CREATE INDEX "NonprofitOrganization_type_verificationStatus_idx" ON "NonprofitOrganization"("type", "verificationStatus");

-- CreateIndex
CREATE INDEX "NonprofitOrganization_slug_idx" ON "NonprofitOrganization"("slug");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationDocument_organizationId_type_idx" ON "OrganizationDocument"("organizationId", "type");

-- CreateIndex
CREATE INDEX "OrganizationDonation_organizationId_createdAt_idx" ON "OrganizationDonation"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationDonation_projectId_idx" ON "OrganizationDonation"("projectId");

-- CreateIndex
CREATE INDEX "DonorRelationship_organizationId_segment_idx" ON "DonorRelationship"("organizationId", "segment");

-- CreateIndex
CREATE UNIQUE INDEX "DonorRelationship_organizationId_email_key" ON "DonorRelationship"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationReport_organizationId_type_year_quarter_key" ON "OrganizationReport"("organizationId", "type", "year", "quarter");

-- CreateIndex
CREATE INDEX "OrganizationActivity_organizationId_createdAt_idx" ON "OrganizationActivity"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationIntegration_organizationId_provider_key" ON "OrganizationIntegration"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_eventName_timestamp_idx" ON "AnalyticsEvent"("eventType", "eventName", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_timestamp_idx" ON "AnalyticsEvent"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "UserSession_userId_startedAt_idx" ON "UserSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "UserSession_deviceId_idx" ON "UserSession"("deviceId");

-- CreateIndex
CREATE INDEX "MetricSnapshot_metricType_period_periodStart_idx" ON "MetricSnapshot"("metricType", "period", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "MetricSnapshot_metricType_period_periodStart_key" ON "MetricSnapshot"("metricType", "period", "periodStart");

-- CreateIndex
CREATE INDEX "Dashboard_ownerId_ownerType_idx" ON "Dashboard"("ownerId", "ownerType");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardShare_dashboardId_sharedWith_key" ON "DashboardShare"("dashboardId", "sharedWith");

-- CreateIndex
CREATE INDEX "AnalyticsFunnel_ownerId_idx" ON "AnalyticsFunnel"("ownerId");

-- CreateIndex
CREATE INDEX "SavedQuery_ownerId_idx" ON "SavedQuery"("ownerId");

-- CreateIndex
CREATE INDEX "Anomaly_metricType_detectedAt_idx" ON "Anomaly"("metricType", "detectedAt");

-- CreateIndex
CREATE INDEX "Anomaly_status_severity_idx" ON "Anomaly"("status", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE INDEX "ExchangeRate_fromCurrency_toCurrency_validFrom_idx" ON "ExchangeRate"("fromCurrency", "toCurrency", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_fromCurrency_toCurrency_validFrom_key" ON "ExchangeRate"("fromCurrency", "toCurrency", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "UserCurrencyPreference_userId_key" ON "UserCurrencyPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCurrency_transactionId_transactionType_key" ON "TransactionCurrency"("transactionId", "transactionType");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE INDEX "Region_isActive_idx" ON "Region"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegion_userId_key" ON "UserRegion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_type_isActive_idx" ON "PaymentMethod"("type", "isActive");

-- CreateIndex
CREATE INDEX "UserPaymentMethod_userId_idx" ON "UserPaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "PayoutAccount_organizationId_idx" ON "PayoutAccount"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxJurisdiction_code_key" ON "TaxJurisdiction"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationTaxStatus_organizationId_jurisdictionId_key" ON "OrganizationTaxStatus"("organizationId", "jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionLaunch_regionCode_key" ON "RegionLaunch"("regionCode");

-- CreateIndex
CREATE INDEX "NotificationDelivery_notificationId_idx" ON "NotificationDelivery"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationDelivery_channel_status_idx" ON "NotificationDelivery"("channel", "status");

-- CreateIndex
CREATE INDEX "NotificationChannel_userId_channel_idx" ON "NotificationChannel"("userId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationChannel_userId_channel_identifier_key" ON "NotificationChannel"("userId", "channel", "identifier");

-- CreateIndex
CREATE INDEX "NotificationDigest_userId_frequency_periodStart_idx" ON "NotificationDigest"("userId", "frequency", "periodStart");

-- CreateIndex
CREATE INDEX "NotificationDigest_status_idx" ON "NotificationDigest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_name_key" ON "NotificationTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTrigger_name_key" ON "NotificationTrigger"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationMetric_date_type_channel_key" ON "NotificationMetric"("date", "type", "channel");

-- CreateIndex
CREATE INDEX "SocialAccount_userId_idx" ON "SocialAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_provider_providerId_key" ON "SocialAccount"("provider", "providerId");

-- CreateIndex
CREATE INDEX "SocialShare_entityType_entityId_idx" ON "SocialShare"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SocialShare_userId_platform_idx" ON "SocialShare"("userId", "platform");

-- CreateIndex
CREATE INDEX "SocialShare_createdAt_idx" ON "SocialShare"("createdAt");

-- CreateIndex
CREATE INDEX "SocialPost_userId_status_idx" ON "SocialPost"("userId", "status");

-- CreateIndex
CREATE INDEX "SocialPost_scheduledFor_status_idx" ON "SocialPost"("scheduledFor", "status");

-- CreateIndex
CREATE INDEX "ImportedContact_userId_status_idx" ON "ImportedContact"("userId", "status");

-- CreateIndex
CREATE INDEX "ImportedContact_matchedUserId_idx" ON "ImportedContact"("matchedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportedContact_userId_source_email_key" ON "ImportedContact"("userId", "source", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SocialChallenge_hashtag_key" ON "SocialChallenge"("hashtag");

-- CreateIndex
CREATE INDEX "SocialChallenge_hashtag_idx" ON "SocialChallenge"("hashtag");

-- CreateIndex
CREATE INDEX "SocialChallenge_status_endDate_idx" ON "SocialChallenge"("status", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "SocialChallengeParticipant_challengeId_userId_key" ON "SocialChallengeParticipant"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "Milestone_entityType_entityId_idx" ON "Milestone"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Milestone_reachedAt_idx" ON "Milestone"("reachedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_entityType_entityId_milestoneType_key" ON "Milestone"("entityType", "entityId", "milestoneType");

-- CreateIndex
CREATE INDEX "ReflectionCard_userId_cardType_idx" ON "ReflectionCard"("userId", "cardType");

-- CreateIndex
CREATE INDEX "SharedJourney_status_idx" ON "SharedJourney"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyMember_journeyId_userId_key" ON "JourneyMember"("journeyId", "userId");

-- CreateIndex
CREATE INDEX "JourneyMoment_journeyId_createdAt_idx" ON "JourneyMoment"("journeyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReflectionPeriod_slug_key" ON "ReflectionPeriod"("slug");

-- CreateIndex
CREATE INDEX "ReflectionPeriod_isActive_startDate_idx" ON "ReflectionPeriod"("isActive", "startDate");

-- CreateIndex
CREATE INDEX "ThankYouNote_recipientId_readAt_idx" ON "ThankYouNote"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "UserConsent_userId_idx" ON "UserConsent"("userId");

-- CreateIndex
CREATE INDEX "UserConsent_consentType_granted_idx" ON "UserConsent"("consentType", "granted");

-- CreateIndex
CREATE UNIQUE INDEX "UserConsent_userId_consentType_key" ON "UserConsent"("userId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentPolicy_type_key" ON "ConsentPolicy"("type");

-- CreateIndex
CREATE INDEX "ConsentPolicy_type_isActive_idx" ON "ConsentPolicy"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DataCategory_name_key" ON "DataCategory"("name");

-- CreateIndex
CREATE INDEX "DataRequest_userId_type_idx" ON "DataRequest"("userId", "type");

-- CreateIndex
CREATE INDEX "DataRequest_status_idx" ON "DataRequest"("status");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_eventType_idx" ON "SecurityEvent"("userId", "eventType");

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "SecuritySession_token_key" ON "SecuritySession"("token");

-- CreateIndex
CREATE INDEX "SecuritySession_userId_isRevoked_idx" ON "SecuritySession"("userId", "isRevoked");

-- CreateIndex
CREATE INDEX "SecuritySession_token_idx" ON "SecuritySession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorAuth_userId_key" ON "TwoFactorAuth"("userId");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_entityType_entityId_idx" ON "SecurityAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_userId_createdAt_idx" ON "SecurityAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_action_createdAt_idx" ON "SecurityAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_isBlocked_idx" ON "RateLimit"("identifier", "isBlocked");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_endpoint_windowStart_key" ON "RateLimit"("identifier", "endpoint", "windowStart");

-- CreateIndex
CREATE INDEX "SuspiciousActivity_userId_status_idx" ON "SuspiciousActivity"("userId", "status");

-- CreateIndex
CREATE INDEX "SuspiciousActivity_severity_status_idx" ON "SuspiciousActivity"("severity", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AccountRecovery_token_key" ON "AccountRecovery"("token");

-- CreateIndex
CREATE INDEX "AccountRecovery_userId_idx" ON "AccountRecovery"("userId");

-- CreateIndex
CREATE INDEX "AccountRecovery_token_idx" ON "AccountRecovery"("token");

-- CreateIndex
CREATE INDEX "Automation_isActive_idx" ON "Automation"("isActive");

-- CreateIndex
CREATE INDEX "AutomationRun_automationId_status_idx" ON "AutomationRun"("automationId", "status");

-- CreateIndex
CREATE INDEX "AutomationRun_startedAt_idx" ON "AutomationRun"("startedAt");

-- CreateIndex
CREATE INDEX "AdminWorkflow_entityType_isActive_idx" ON "AdminWorkflow"("entityType", "isActive");

-- CreateIndex
CREATE INDEX "WorkflowInstance_entityType_entityId_idx" ON "WorkflowInstance"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "WorkflowInstance_workflowId_status_idx" ON "WorkflowInstance"("workflowId", "status");

-- CreateIndex
CREATE INDEX "WorkflowApproval_instanceId_stepNumber_idx" ON "WorkflowApproval"("instanceId", "stepNumber");

-- CreateIndex
CREATE INDEX "WorkflowApproval_approverId_idx" ON "WorkflowApproval"("approverId");

-- CreateIndex
CREATE INDEX "ScheduledTask_isActive_nextRunAt_idx" ON "ScheduledTask"("isActive", "nextRunAt");

-- CreateIndex
CREATE INDEX "TaskRun_taskId_startedAt_idx" ON "TaskRun"("taskId", "startedAt");

-- CreateIndex
CREATE INDEX "BusinessRule_category_isActive_idx" ON "BusinessRule"("category", "isActive");

-- CreateIndex
CREATE INDEX "BusinessRule_entityType_isActive_idx" ON "BusinessRule"("entityType", "isActive");

-- CreateIndex
CREATE INDEX "RuleEvaluation_ruleId_evaluatedAt_idx" ON "RuleEvaluation"("ruleId", "evaluatedAt");

-- CreateIndex
CREATE INDEX "RuleEvaluation_entityType_entityId_idx" ON "RuleEvaluation"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "BulkOperation_status_idx" ON "BulkOperation"("status");

-- CreateIndex
CREATE INDEX "BulkOperation_createdBy_idx" ON "BulkOperation"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "WorkQueue_name_key" ON "WorkQueue"("name");

-- CreateIndex
CREATE INDEX "WorkQueue_isActive_idx" ON "WorkQueue"("isActive");

-- CreateIndex
CREATE INDEX "QueueItem_queueId_status_priority_idx" ON "QueueItem"("queueId", "status", "priority");

-- CreateIndex
CREATE INDEX "QueueItem_assignedTo_status_idx" ON "QueueItem"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "WatershedLoan_userId_status_idx" ON "WatershedLoan"("userId", "status");

-- CreateIndex
CREATE INDEX "WatershedLoan_status_idx" ON "WatershedLoan"("status");

-- CreateIndex
CREATE INDEX "WatershedLoanShare_loanId_idx" ON "WatershedLoanShare"("loanId");

-- CreateIndex
CREATE INDEX "WatershedLoanShare_funderId_idx" ON "WatershedLoanShare"("funderId");

-- CreateIndex
CREATE INDEX "WatershedLoanPayment_watershedLoanId_idx" ON "WatershedLoanPayment"("watershedLoanId");

-- CreateIndex
CREATE INDEX "EfficiencyHome_userId_idx" ON "EfficiencyHome"("userId");

-- CreateIndex
CREATE INDEX "EfficiencyHome_status_idx" ON "EfficiencyHome"("status");

-- CreateIndex
CREATE INDEX "EfficiencyHome_zipCode_idx" ON "EfficiencyHome"("zipCode");

-- CreateIndex
CREATE INDEX "EfficiencyHome_neighborhoodBatchId_idx" ON "EfficiencyHome"("neighborhoodBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "EfficiencyAssessment_homeId_key" ON "EfficiencyAssessment"("homeId");

-- CreateIndex
CREATE UNIQUE INDEX "EfficiencyPhase_projectId_key" ON "EfficiencyPhase"("projectId");

-- CreateIndex
CREATE INDEX "EfficiencyPhase_homeId_idx" ON "EfficiencyPhase"("homeId");

-- CreateIndex
CREATE INDEX "EfficiencyPhase_status_idx" ON "EfficiencyPhase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EfficiencyPhase_homeId_phaseNumber_key" ON "EfficiencyPhase"("homeId", "phaseNumber");

-- CreateIndex
CREATE INDEX "EfficiencyNomination_nominatorId_idx" ON "EfficiencyNomination"("nominatorId");

-- CreateIndex
CREATE INDEX "EfficiencyNomination_status_idx" ON "EfficiencyNomination"("status");

-- CreateIndex
CREATE UNIQUE INDEX "NeighborhoodCascade_projectId_key" ON "NeighborhoodCascade"("projectId");

-- CreateIndex
CREATE INDEX "NeighborhoodCascade_zipCode_idx" ON "NeighborhoodCascade"("zipCode");

-- CreateIndex
CREATE INDEX "NeighborhoodCascade_status_idx" ON "NeighborhoodCascade"("status");
