import { prisma } from './prisma';
import { randomBytes } from 'crypto';
import { createCircleActivity } from './circle-activity';

// Generate invite token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Create invite
export async function createCircleInvite(
  circleId: string,
  invitedBy: string,
  email?: string,
  expiresInDays: number = 7
) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  return prisma.circleInvite.create({
    data: {
      circleId,
      email,
      token,
      invitedBy,
      expiresAt,
    },
  });
}

// Create bulk invites
export async function createBulkInvites(
  circleId: string,
  invitedBy: string,
  emails: string[]
) {
  const invites = emails.map((email) => ({
    circleId,
    email,
    token: generateToken(),
    invitedBy,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }));

  await prisma.circleInvite.createMany({
    data: invites,
  });

  return prisma.circleInvite.findMany({
    where: {
      circleId,
      email: { in: emails },
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Validate invite
export async function validateInvite(token: string) {
  const invite = await prisma.circleInvite.findUnique({
    where: { token },
    include: {
      circle: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          memberLimit: true,
          _count: { select: { members: { where: { status: 'active' } } } },
        },
      },
    },
  });

  if (!invite) {
    return { valid: false, error: 'Invite not found' };
  }

  if (invite.usedAt) {
    return { valid: false, error: 'Invite already used' };
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, error: 'Invite expired' };
  }

  if (
    invite.circle.memberLimit &&
    invite.circle._count.members >= invite.circle.memberLimit
  ) {
    return { valid: false, error: 'Circle is at capacity' };
  }

  return { valid: true, invite };
}

// Accept invite
export async function acceptInvite(token: string, userId: string) {
  const validation = await validateInvite(token);

  if (!validation.valid || !validation.invite) {
    throw new Error(validation.error || 'Invalid invite');
  }

  const { invite } = validation;

  // Check if already a member
  const existing = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId: invite.circleId, userId } },
  });

  if (existing?.status === 'active') {
    throw new Error('Already a member');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  await prisma.$transaction(async (tx) => {
    // Mark invite as used
    await tx.circleInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date(), usedBy: userId },
    });

    // Create or reactivate membership
    if (existing) {
      await tx.circleMember.update({
        where: { id: existing.id },
        data: { status: 'active', joinedAt: new Date() },
      });
    } else {
      await tx.circleMember.create({
        data: {
          circleId: invite.circleId,
          userId,
          role: 'member',
          status: 'active',
        },
      });
    }
  });

  await createCircleActivity(invite.circleId, 'member_joined', userId, {
    name: user?.name || 'Unknown',
    viaInvite: true,
  });

  return invite.circle;
}

// Get pending invites for a circle
export async function getCircleInvites(circleId: string) {
  return prisma.circleInvite.findMany({
    where: {
      circleId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Revoke invite
export async function revokeInvite(inviteId: string) {
  return prisma.circleInvite.delete({
    where: { id: inviteId },
  });
}

// Generate shareable invite link (without email)
export async function generateShareableLink(
  circleId: string,
  invitedBy: string,
  expiresInDays: number = 30
) {
  return createCircleInvite(circleId, invitedBy, undefined, expiresInDays);
}
