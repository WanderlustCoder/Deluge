import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStrategicPlans, createStrategicPlan } from "@/lib/aquifer";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { logError } from "@/lib/logger";

const createPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  vision: z.string().min(1, "Vision is required"),
  fundingGoal: z.number().positive("Funding goal must be positive"),
});

// GET: List strategic plans
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("includeArchived") === "true";

  const plans = await getStrategicPlans(includeArchived);

  return NextResponse.json(plans);
}

// POST: Create a new strategic plan (admin only)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const plan = await createStrategicPlan(parsed.data);

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "create_strategic_plan",
      targetType: "strategic_plan",
      targetId: plan.id,
      details: JSON.stringify({ title: plan.title, fundingGoal: plan.fundingGoal }),
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    logError("api/aquifer/plans", error, { userId: session.user.id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
