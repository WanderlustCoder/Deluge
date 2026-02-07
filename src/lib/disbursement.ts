import { prisma } from "@/lib/prisma";
import { frontDisbursement, getReserveHealth } from "@/lib/reserve";

/**
 * Trigger a disbursement for a project.
 * Marks pledged allocations as disbursed and creates a ProjectDisbursement record.
 */
export async function triggerDisbursement(
  projectId: string,
  options?: { source?: string; initiatedBy?: string; notes?: string }
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  // Sum pledged (undisbursed) allocations
  const pledgedAllocations = await prisma.allocation.findMany({
    where: { projectId, status: "pledged" },
  });

  const totalToDisburst = pledgedAllocations.reduce(
    (s, a) => s + a.amount,
    0
  );
  if (totalToDisburst <= 0) return null;

  const source = options?.source ?? "reserve_fronted";

  // Create the disbursement record
  const disbursement = await prisma.projectDisbursement.create({
    data: {
      projectId,
      amount: Math.round(totalToDisburst * 100) / 100,
      source,
      status: "completed",
      initiatedBy: options?.initiatedBy ?? null,
      notes: options?.notes ?? null,
    },
  });

  // Mark allocations as disbursed
  const now = new Date();
  await prisma.allocation.updateMany({
    where: { id: { in: pledgedAllocations.map((a) => a.id) } },
    data: {
      status: "disbursed",
      disbursedAt: now,
      disbursementId: disbursement.id,
    },
  });

  // Update project disbursement tracking
  const newDisbursedAmount = project.disbursedAmount + totalToDisburst;
  const disbursementStatus =
    newDisbursedAmount >= project.fundingRaised ? "disbursed" : "partial";

  await prisma.project.update({
    where: { id: projectId },
    data: {
      disbursedAmount: Math.round(newDisbursedAmount * 100) / 100,
      disbursementStatus,
    },
  });

  // If fronted from reserve, debit the reserve
  if (source === "reserve_fronted") {
    try {
      await frontDisbursement(totalToDisburst, disbursement.id);
    } catch {
      // If reserve insufficient, disbursement still recorded but we log it
      await prisma.projectDisbursement.update({
        where: { id: disbursement.id },
        data: { notes: "Reserve insufficient - disbursement recorded but not fronted" },
      });
    }
  }

  return disbursement;
}

/**
 * Auto-disburse check: called when a project reaches "funded".
 * Only disburses if reserve is healthy.
 */
export async function checkAutoDisburse(projectId: string) {
  const health = await getReserveHealth();
  if (health.healthStatus === "critical") return null;

  return triggerDisbursement(projectId, {
    source: "reserve_fronted",
    notes: "Auto-disbursed on full funding",
  });
}
