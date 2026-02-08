/**
 * Family Shared Watershed
 *
 * Manages shared watershed for family accounts.
 */

import { prisma } from "@/lib/prisma";
import { logInfo } from "@/lib/logger";

/**
 * Enable shared watershed for a family
 */
export async function enableSharedWatershed(
  familyId: string,
  requesterId: string
): Promise<{ watershedId: string }> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: { user: { include: { watershed: true } } },
      },
    },
  });

  if (!family) {
    throw new Error("Family not found");
  }

  // Check requester is admin
  const requester = family.members.find((m) => m.userId === requesterId);
  if (!requester || requester.role !== "admin") {
    throw new Error("Only admins can enable shared watershed");
  }

  if (family.sharedWatershedEnabled) {
    throw new Error("Shared watershed already enabled");
  }

  // Create a shared watershed
  const sharedWatershed = await prisma.watershed.create({
    data: {
      userId: requesterId, // Associate with admin for now
      balance: 0,
    },
  });

  // Note: We don't merge individual watersheds - they stay separate
  // The shared one is an additional option for family giving

  await prisma.family.update({
    where: { id: familyId },
    data: {
      sharedWatershedEnabled: true,
      sharedWatershedId: sharedWatershed.id,
    },
  });

  logInfo("family-watershed", "Shared watershed enabled", { familyId });

  return { watershedId: sharedWatershed.id };
}

/**
 * Disable shared watershed
 */
export async function disableSharedWatershed(
  familyId: string,
  requesterId: string
): Promise<void> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: { sharedWatershed: true, members: true },
  });

  if (!family) {
    throw new Error("Family not found");
  }

  const requester = family.members.find((m) => m.userId === requesterId);
  if (!requester || requester.role !== "admin") {
    throw new Error("Only admins can disable shared watershed");
  }

  if (!family.sharedWatershedEnabled) {
    return;
  }

  // Check if shared watershed has balance
  if (family.sharedWatershed && family.sharedWatershed.balance > 0) {
    throw new Error(
      "Cannot disable shared watershed with remaining balance. Deploy or distribute funds first."
    );
  }

  await prisma.family.update({
    where: { id: familyId },
    data: {
      sharedWatershedEnabled: false,
      sharedWatershedId: null,
    },
  });

  // Delete the empty watershed
  if (family.sharedWatershedId) {
    await prisma.watershed.delete({
      where: { id: family.sharedWatershedId },
    });
  }

  logInfo("family-watershed", "Shared watershed disabled", { familyId });
}

/**
 * Get watershed(s) for a family member
 */
export async function getWatershedsForMember(memberId: string): Promise<{
  personal: { id: string; balance: number } | null;
  shared: { id: string; balance: number } | null;
}> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: {
      user: { include: { watershed: true } },
      family: { include: { sharedWatershed: true } },
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  return {
    personal: member.user.watershed
      ? { id: member.user.watershed.id, balance: member.user.watershed.balance }
      : null,
    shared:
      member.family.sharedWatershedEnabled && member.family.sharedWatershed
        ? {
            id: member.family.sharedWatershed.id,
            balance: member.family.sharedWatershed.balance,
          }
        : null,
  };
}

/**
 * Record a contribution to family activity
 */
export async function recordFamilyContribution(
  memberId: string,
  amount: number,
  projectId: string
): Promise<void> {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) return;

  await prisma.familyActivity.create({
    data: {
      familyId: member.familyId,
      memberId,
      actionType: "contribution",
      description: `Funded project`,
      projectId,
      amount,
    },
  });

  // Update family goal progress
  await updateFamilyGoalProgress(member.familyId, "amount_given", amount);
  await updateFamilyGoalProgress(member.familyId, "projects_funded", 1);
}

/**
 * Update family goal progress
 */
async function updateFamilyGoalProgress(
  familyId: string,
  targetType: string,
  increment: number
): Promise<void> {
  const goals = await prisma.familyGoal.findMany({
    where: {
      familyId,
      status: "active",
      targetType,
    },
  });

  for (const goal of goals) {
    const newValue = goal.currentValue + increment;
    const completed = newValue >= goal.targetValue;

    await prisma.familyGoal.update({
      where: { id: goal.id },
      data: {
        currentValue: newValue,
        status: completed ? "completed" : "active",
      },
    });

    if (completed) {
      await prisma.familyActivity.create({
        data: {
          familyId,
          memberId: "", // System event
          actionType: "goal_completed",
          description: `Completed goal: ${goal.title}`,
        },
      });
    }
  }
}

/**
 * Contribute from personal to shared watershed
 */
export async function contributeToSharedWatershed(
  userId: string,
  amount: number
): Promise<void> {
  const member = await prisma.familyMember.findUnique({
    where: { userId },
    include: {
      user: { include: { watershed: true } },
      family: true,
    },
  });

  if (!member) {
    throw new Error("Not a family member");
  }

  if (!member.family.sharedWatershedEnabled || !member.family.sharedWatershedId) {
    throw new Error("Shared watershed not enabled");
  }

  const personalWatershed = member.user.watershed;
  if (!personalWatershed || personalWatershed.balance < amount) {
    throw new Error("Insufficient balance");
  }

  // Transfer
  await prisma.$transaction([
    prisma.watershed.update({
      where: { id: personalWatershed.id },
      data: { balance: { decrement: amount } },
    }),
    prisma.watershed.update({
      where: { id: member.family.sharedWatershedId },
      data: { balance: { increment: amount } },
    }),
    prisma.familyActivity.create({
      data: {
        familyId: member.familyId,
        memberId: member.id,
        actionType: "shared_contribution",
        description: `Contributed to shared watershed`,
        amount,
      },
    }),
  ]);

  logInfo("family-watershed", "Contributed to shared watershed", {
    userId,
    amount,
    familyId: member.familyId,
  });
}
