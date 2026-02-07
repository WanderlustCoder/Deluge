import { prisma } from './prisma';
import { randomBytes } from 'crypto';
import { addEmployee } from './corporate';

// Generate invite token
function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}

// Create invite
export async function createInvite(
  corporateAccountId: string,
  email: string,
  expiresInDays: number = 7
) {
  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Check if invite already exists for this email
  const existing = await prisma.corporateInvite.findFirst({
    where: {
      corporateAccountId,
      email,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (existing) {
    // Update existing invite
    return prisma.corporateInvite.update({
      where: { id: existing.id },
      data: {
        token,
        expiresAt,
      },
    });
  }

  return prisma.corporateInvite.create({
    data: {
      corporateAccountId,
      email,
      token,
      expiresAt,
    },
  });
}

// Create bulk invites
export async function createBulkInvites(
  corporateAccountId: string,
  emails: string[],
  expiresInDays: number = 7
) {
  const results = await Promise.all(
    emails.map((email) => createInvite(corporateAccountId, email, expiresInDays))
  );
  return results;
}

// Get invite by token
export async function getInviteByToken(token: string) {
  return prisma.corporateInvite.findUnique({
    where: { token },
    include: {
      corporateAccount: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          primaryColor: true,
        },
      },
    },
  });
}

// Accept invite
export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.corporateInvite.findUnique({
    where: { token },
    include: {
      corporateAccount: true,
    },
  });

  if (!invite) {
    throw new Error('Invite not found');
  }

  if (invite.usedAt) {
    throw new Error('Invite has already been used');
  }

  if (invite.expiresAt < new Date()) {
    throw new Error('Invite has expired');
  }

  // Add employee
  await addEmployee(invite.corporateAccountId, userId);

  // Mark invite as used
  await prisma.corporateInvite.update({
    where: { id: invite.id },
    data: {
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  return invite.corporateAccount;
}

// List pending invites for a corporate account
export async function listPendingInvites(corporateAccountId: string) {
  return prisma.corporateInvite.findMany({
    where: {
      corporateAccountId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Revoke invite
export async function revokeInvite(id: string) {
  return prisma.corporateInvite.delete({
    where: { id },
  });
}

// Resend invite (regenerate token and extend expiry)
export async function resendInvite(id: string, expiresInDays: number = 7) {
  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  return prisma.corporateInvite.update({
    where: { id },
    data: {
      token,
      expiresAt,
    },
  });
}

// Clean up expired invites
export async function cleanupExpiredInvites() {
  return prisma.corporateInvite.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      usedAt: null,
    },
  });
}
