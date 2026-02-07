import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStrategicPlan, updateStrategicPlan, completeStrategicPlan } from "@/lib/aquifer";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { logError } from "@/lib/logger";

const updatePlanSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  vision: z.string().min(1).optional(),
  fundingGoal: z.number().positive().optional(),
  status: z.enum(["active", "funded", "completed", "archived"]).optional(),
  order: z.number().int().optional(),
});

// GET: Get strategic plan detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await getStrategicPlan(id);

  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

// PATCH: Update strategic plan (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Handle complete action
    if (body.action === "complete") {
      const result = await completeStrategicPlan(id);

      logAudit({
        adminId: session.user.id,
        adminEmail: session.user.email!,
        action: "complete_strategic_plan",
        targetType: "strategic_plan",
        targetId: id,
        details: JSON.stringify({ nextPlanId: result.nextPlan?.id }),
      });

      return NextResponse.json({ success: true, data: result });
    }

    const parsed = updatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const plan = await updateStrategicPlan(id, parsed.data);

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "update_strategic_plan",
      targetType: "strategic_plan",
      targetId: id,
      details: JSON.stringify(parsed.data),
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { id } = await params;
    logError("api/aquifer/plans/[id]", error, { userId: session.user.id, planId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Archive strategic plan (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Don't delete, just archive
    const plan = await updateStrategicPlan(id, { status: "archived" });

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "archive_strategic_plan",
      targetType: "strategic_plan",
      targetId: id,
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    const { id } = await params;
    logError("api/aquifer/plans/[id]", error, { userId: session.user.id, planId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
