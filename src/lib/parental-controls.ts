/**
 * Parental Controls
 *
 * Spending limits and approval requirements for child accounts.
 */

import { prisma } from "@/lib/prisma";
import { logInfo } from "@/lib/logger";

export interface ParentalSettings {
  monthlyLimit: number | null;
  requireApproval: boolean;
  allowedCategories: string[] | null;
}

/**
 * Set monthly limit for a member
 */
export async function setMonthlyLimit(
  memberId: string,
  limit: number | null,
  adminUserId: string
): Promise<void> {
  await verifyAdmin(memberId, adminUserId);

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { monthlyLimit: limit },
  });

  logInfo("parental-controls", "Monthly limit updated", { memberId, limit });
}

/**
 * Set approval requirement
 */
export async function setRequireApproval(
  memberId: string,
  required: boolean,
  adminUserId: string
): Promise<void> {
  await verifyAdmin(memberId, adminUserId);

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { requireApproval: required },
  });

  logInfo("parental-controls", "Approval requirement updated", {
    memberId,
    required,
  });
}

/**
 * Set allowed categories
 */
export async function setAllowedCategories(
  memberId: string,
  categories: string[] | null,
  adminUserId: string
): Promise<void> {
  await verifyAdmin(memberId, adminUserId);

  await prisma.familyMember.update({
    where: { id: memberId },
    data: {
      allowedCategories: categories ? JSON.stringify(categories) : null,
    },
  });

  logInfo("parental-controls", "Allowed categories updated", {
    memberId,
    categories,
  });
}

/**
 * Request approval for an action
 */
export async function requestApproval(
  memberId: string,
  actionType: string,
  targetId: string,
  amount: number
): Promise<{ actionId: string }> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const action = await prisma.pendingFamilyAction.create({
    data: {
      familyId: member.familyId,
      memberId,
      actionType,
      targetId,
      amount,
      status: "pending",
    },
  });

  logInfo("parental-controls", "Approval requested", {
    actionId: action.id,
    actionType,
  });

  // TODO: Notify parent/admin

  return { actionId: action.id };
}

/**
 * Approve a pending action
 */
export async function approveAction(
  actionId: string,
  approverId: string
): Promise<void> {
  const action = await prisma.pendingFamilyAction.findUnique({
    where: { id: actionId },
  });

  if (!action) {
    throw new Error("Action not found");
  }

  if (action.status !== "pending") {
    throw new Error("Action already resolved");
  }

  // Verify approver is admin
  const approver = await prisma.familyMember.findFirst({
    where: { familyId: action.familyId, userId: approverId },
  });

  if (!approver || approver.role !== "admin") {
    throw new Error("Only admins can approve actions");
  }

  await prisma.pendingFamilyAction.update({
    where: { id: actionId },
    data: {
      status: "approved",
      approverId,
      resolvedAt: new Date(),
    },
  });

  logInfo("parental-controls", "Action approved", { actionId, approverId });

  // TODO: Process the original action
  // This would need integration with the fund/loan routes
}

/**
 * Deny a pending action
 */
export async function denyAction(
  actionId: string,
  approverId: string,
  note?: string
): Promise<void> {
  const action = await prisma.pendingFamilyAction.findUnique({
    where: { id: actionId },
  });

  if (!action) {
    throw new Error("Action not found");
  }

  if (action.status !== "pending") {
    throw new Error("Action already resolved");
  }

  const approver = await prisma.familyMember.findFirst({
    where: { familyId: action.familyId, userId: approverId },
  });

  if (!approver || approver.role !== "admin") {
    throw new Error("Only admins can deny actions");
  }

  await prisma.pendingFamilyAction.update({
    where: { id: actionId },
    data: {
      status: "denied",
      approverId,
      note,
      resolvedAt: new Date(),
    },
  });

  logInfo("parental-controls", "Action denied", { actionId, approverId });

  // TODO: Notify the child
}

/**
 * Check if a member is within their limits
 */
export async function checkWithinLimits(
  memberId: string,
  amount: number,
  projectCategory?: string
): Promise<{
  allowed: boolean;
  reason?: string;
  requiresApproval: boolean;
}> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    return { allowed: true, requiresApproval: false };
  }

  // Check category restrictions
  if (member.allowedCategories && projectCategory) {
    const allowed = JSON.parse(member.allowedCategories) as string[];
    if (allowed.length > 0 && !allowed.includes(projectCategory)) {
      return {
        allowed: false,
        reason: "This category is not allowed by your family settings",
        requiresApproval: true,
      };
    }
  }

  // Check monthly limit
  if (member.monthlyLimit !== null) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Get this month's spending
    const monthlySpending = await prisma.familyActivity.aggregate({
      where: {
        memberId,
        actionType: "contribution",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    const spent = monthlySpending._sum.amount || 0;
    const remaining = member.monthlyLimit - spent;

    if (amount > remaining) {
      return {
        allowed: false,
        reason: `This would exceed your monthly limit ($${remaining.toFixed(2)} remaining)`,
        requiresApproval: true,
      };
    }
  }

  // Check if approval is required
  if (member.requireApproval) {
    return {
      allowed: true,
      requiresApproval: true,
    };
  }

  return { allowed: true, requiresApproval: false };
}

/**
 * Get pending actions for a family
 */
export async function getPendingActions(familyId: string) {
  return prisma.pendingFamilyAction.findMany({
    where: { familyId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a member's pending actions
 */
export async function getMemberPendingActions(memberId: string) {
  return prisma.pendingFamilyAction.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

// --- Helpers ---

async function verifyAdmin(memberId: string, adminUserId: string): Promise<void> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const admin = await prisma.familyMember.findFirst({
    where: { familyId: member.familyId, userId: adminUserId },
  });

  if (!admin || admin.role !== "admin") {
    throw new Error("Only admins can modify parental controls");
  }
}
