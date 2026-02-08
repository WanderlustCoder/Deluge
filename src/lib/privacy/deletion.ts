import { prisma } from '@/lib/prisma';

// Request account deletion
export async function requestAccountDeletion(userId: string) {
  return prisma.dataRequest.create({
    data: {
      userId,
      type: 'deletion',
      status: 'pending',
    },
  });
}

// Process account deletion
export async function processAccountDeletion(requestId: string, processedBy?: string) {
  const request = await prisma.dataRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Request already processed');
  }

  // Mark as processing
  await prisma.dataRequest.update({
    where: { id: requestId },
    data: { status: 'processing' },
  });

  try {
    // Anonymize user data rather than hard delete
    // This preserves transaction integrity while removing PII
    await anonymizeUser(request.userId);

    await prisma.dataRequest.update({
      where: { id: requestId },
      data: {
        status: 'completed',
        processedAt: new Date(),
        processedBy,
      },
    });
  } catch (error) {
    await prisma.dataRequest.update({
      where: { id: requestId },
      data: {
        status: 'failed',
        processedAt: new Date(),
        notes: error instanceof Error ? error.message : 'Deletion failed',
      },
    });
    throw error;
  }
}

// Anonymize user data (GDPR-compliant deletion)
export async function anonymizeUser(userId: string) {
  const anonymizedEmail = `deleted-${userId}@anonymous.local`;
  const anonymizedName = 'Deleted User';

  // Update user to anonymized state
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: anonymizedEmail,
      name: anonymizedName,
      passwordHash: '', // Clear password
      bio: null,
      avatarUrl: null,
      interests: null,
      archivedAt: new Date(),
    },
  });

  // Delete privacy-sensitive data
  await prisma.$transaction([
    // Delete consents
    prisma.userConsent.deleteMany({ where: { userId } }),
    // Delete privacy settings
    prisma.privacySettings.deleteMany({ where: { userId } }),
    // Delete security sessions
    prisma.securitySession.deleteMany({ where: { userId } }),
    // Delete 2FA
    prisma.twoFactorAuth.deleteMany({ where: { userId } }),
    // Delete recovery tokens
    prisma.accountRecovery.deleteMany({ where: { userId } }),
    // Delete notification preferences
    prisma.notificationPreference.deleteMany({ where: { userId } }),
    // Delete push subscriptions
    prisma.pushSubscription.deleteMany({ where: { userId } }),
    // Delete social accounts
    prisma.socialAccount.deleteMany({ where: { userId } }),
  ]);

  // Log the anonymization
  await prisma.securityAuditLog.create({
    data: {
      userId,
      action: 'delete',
      entityType: 'user',
      entityId: userId,
      metadata: JSON.stringify({ reason: 'user_requested_deletion' }),
    },
  });
}

// Schedule deletion with grace period
export async function scheduleDeletion(
  userId: string,
  gracePeriodDays: number = 30
) {
  const request = await prisma.dataRequest.create({
    data: {
      userId,
      type: 'deletion',
      status: 'pending',
      notes: `Scheduled for deletion after ${gracePeriodDays} day grace period`,
    },
  });

  // Archive the user account immediately
  await prisma.user.update({
    where: { id: userId },
    data: { archivedAt: new Date() },
  });

  return request;
}

// Cancel pending deletion
export async function cancelDeletion(requestId: string) {
  const request = await prisma.dataRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Cannot cancel - request already processed');
  }

  await prisma.$transaction([
    // Cancel the request
    prisma.dataRequest.update({
      where: { id: requestId },
      data: { status: 'failed', notes: 'Cancelled by user' },
    }),
    // Unarchive the user
    prisma.user.update({
      where: { id: request.userId },
      data: { archivedAt: null },
    }),
  ]);
}

// Get pending deletion requests (for admin)
export async function getPendingDeletionRequests() {
  return prisma.dataRequest.findMany({
    where: { status: 'pending', type: 'deletion' },
    include: { user: { select: { email: true, name: true, archivedAt: true } } },
    orderBy: { requestedAt: 'asc' },
  });
}

// Process expired grace periods
export async function processExpiredGracePeriods(gracePeriodDays: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);

  const expiredRequests = await prisma.dataRequest.findMany({
    where: {
      status: 'pending',
      type: 'deletion',
      requestedAt: { lt: cutoffDate },
    },
  });

  for (const request of expiredRequests) {
    await processAccountDeletion(request.id, 'system');
  }

  return expiredRequests.length;
}
