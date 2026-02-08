/**
 * Family Accounts - Core CRUD
 *
 * Enables family/household accounts with shared giving.
 */

import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";
import { logInfo, logError } from "@/lib/logger";

export type FamilyRole = "admin" | "adult" | "child";

/**
 * Create a new family
 */
export async function createFamily(
  adminUserId: string,
  name: string
): Promise<{ familyId: string }> {
  // Check user doesn't already belong to a family
  const existing = await prisma.familyMember.findUnique({
    where: { userId: adminUserId },
  });

  if (existing) {
    throw new Error("User already belongs to a family");
  }

  const family = await prisma.family.create({
    data: {
      name,
      members: {
        create: {
          userId: adminUserId,
          role: "admin",
        },
      },
    },
  });

  logInfo("family", "Family created", { familyId: family.id, adminUserId });

  return { familyId: family.id };
}

/**
 * Get user's family
 */
export async function getUserFamily(userId: string) {
  const membership = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      family: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          sharedWatershed: true,
          goals: {
            where: { status: "active" },
          },
        },
      },
    },
  });

  if (!membership) return null;

  return {
    ...membership.family,
    currentMember: {
      id: membership.id,
      role: membership.role,
      nickname: membership.nickname,
      monthlyLimit: membership.monthlyLimit,
      requireApproval: membership.requireApproval,
    },
  };
}

/**
 * Invite a family member
 */
export async function inviteFamilyMember(
  familyId: string,
  email: string,
  role: FamilyRole
): Promise<{ token: string }> {
  // Check if email is already in the family
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { familyMembership: true },
  });

  if (existingUser?.familyMembership) {
    throw new Error("This user is already in a family");
  }

  // Check for existing pending invite
  await prisma.familyInvite.deleteMany({
    where: { email: email.toLowerCase().trim(), familyId },
  });

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

  await prisma.familyInvite.create({
    data: {
      familyId,
      email: email.toLowerCase().trim(),
      role,
      token,
      expiresAt,
    },
  });

  logInfo("family", "Family invite sent", { familyId, email, role });

  return { token };
}

/**
 * Accept a family invite
 */
export async function acceptFamilyInvite(
  token: string,
  userId: string
): Promise<{ familyId: string }> {
  const invite = await prisma.familyInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new Error("Invalid invite");
  }

  if (invite.status !== "pending") {
    throw new Error("Invite already used");
  }

  if (invite.expiresAt < new Date()) {
    await prisma.familyInvite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    throw new Error("Invite has expired");
  }

  // Check user email matches invite
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { familyMembership: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.familyMembership) {
    throw new Error("User already belongs to a family");
  }

  // Add user to family
  await prisma.familyMember.create({
    data: {
      familyId: invite.familyId,
      userId,
      role: invite.role,
      requireApproval: invite.role === "child",
    },
  });

  // Mark invite as used
  await prisma.familyInvite.update({
    where: { id: invite.id },
    data: { status: "accepted" },
  });

  logInfo("family", "Family invite accepted", {
    familyId: invite.familyId,
    userId,
    role: invite.role,
  });

  return { familyId: invite.familyId };
}

/**
 * Remove a family member
 */
export async function removeFamilyMember(
  familyId: string,
  memberId: string,
  requesterId: string
): Promise<void> {
  // Check requester is admin
  const requester = await prisma.familyMember.findFirst({
    where: { familyId, userId: requesterId },
  });

  if (!requester || requester.role !== "admin") {
    throw new Error("Only family admins can remove members");
  }

  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.familyId !== familyId) {
    throw new Error("Member not found in this family");
  }

  // Don't allow removing last admin
  if (member.role === "admin") {
    const adminCount = await prisma.familyMember.count({
      where: { familyId, role: "admin" },
    });

    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin");
    }
  }

  await prisma.familyMember.delete({
    where: { id: memberId },
  });

  logInfo("family", "Family member removed", { familyId, memberId });
}

/**
 * Update member settings
 */
export async function updateMemberSettings(
  memberId: string,
  settings: {
    nickname?: string;
    role?: FamilyRole;
    monthlyLimit?: number | null;
    requireApproval?: boolean;
    allowedCategories?: string[];
  },
  requesterId: string
): Promise<void> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: { family: true },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  // Check requester is admin or is the member themselves (for nickname only)
  const requester = await prisma.familyMember.findFirst({
    where: { familyId: member.familyId, userId: requesterId },
  });

  if (!requester) {
    throw new Error("Not authorized");
  }

  const isAdmin = requester.role === "admin";
  const isSelf = member.userId === requesterId;

  if (!isAdmin && !isSelf) {
    throw new Error("Not authorized");
  }

  // Self can only update nickname
  if (!isAdmin && (settings.role || settings.monthlyLimit !== undefined || settings.requireApproval !== undefined || settings.allowedCategories)) {
    throw new Error("Only admins can update these settings");
  }

  await prisma.familyMember.update({
    where: { id: memberId },
    data: {
      ...(settings.nickname !== undefined && { nickname: settings.nickname }),
      ...(settings.role && isAdmin && { role: settings.role }),
      ...(settings.monthlyLimit !== undefined && isAdmin && { monthlyLimit: settings.monthlyLimit }),
      ...(settings.requireApproval !== undefined && isAdmin && { requireApproval: settings.requireApproval }),
      ...(settings.allowedCategories && isAdmin && { allowedCategories: JSON.stringify(settings.allowedCategories) }),
    },
  });

  logInfo("family", "Member settings updated", { memberId });
}

/**
 * Leave family
 */
export async function leaveFamily(userId: string): Promise<void> {
  const membership = await prisma.familyMember.findUnique({
    where: { userId },
    include: { family: { include: { members: true } } },
  });

  if (!membership) {
    throw new Error("Not in a family");
  }

  // Don't allow last admin to leave
  if (membership.role === "admin") {
    const adminCount = membership.family.members.filter(m => m.role === "admin").length;
    if (adminCount <= 1 && membership.family.members.length > 1) {
      throw new Error("Transfer admin role to another member before leaving");
    }
  }

  await prisma.familyMember.delete({
    where: { userId },
  });

  // If last member, delete family
  if (membership.family.members.length === 1) {
    await prisma.family.delete({
      where: { id: membership.familyId },
    });
    logInfo("family", "Family deleted (last member left)", { familyId: membership.familyId });
  } else {
    logInfo("family", "User left family", { familyId: membership.familyId, userId });
  }
}

/**
 * Get pending invites for a family
 */
export async function getPendingInvites(familyId: string) {
  return prisma.familyInvite.findMany({
    where: { familyId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Cancel an invite
 */
export async function cancelInvite(inviteId: string): Promise<void> {
  await prisma.familyInvite.delete({
    where: { id: inviteId },
  });
}
