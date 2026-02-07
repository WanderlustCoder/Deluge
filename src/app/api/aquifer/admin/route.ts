import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createFlagshipProject,
  getFlagshipProjects,
  getAquifers,
  getStrategicPlans,
  getActiveStrategicPlan,
} from "@/lib/aquifer";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { PROJECT_CATEGORIES } from "@/lib/constants";

const createFlagshipSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(PROJECT_CATEGORIES as unknown as [string, ...string[]]),
  fundingGoal: z.number().positive("Funding goal must be positive"),
  location: z.string().min(1, "Location is required"),
  imageUrl: z.string().optional(),
  fundingSource: z.enum(["reserve", "pool"]),
  strategicPlanId: z.string().optional(), // Required for reserve-funded
});

// GET: Admin view of aquifer funds and projects
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [funds, flagships, recentContributions, strategicPlans, activePlan] = await Promise.all([
    getAquifers(),
    getFlagshipProjects(),
    prisma.aquiferContribution.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        aquifer: { select: { type: true } },
      },
    }),
    getStrategicPlans(),
    getActiveStrategicPlan(),
  ]);

  return NextResponse.json({
    funds,
    flagships,
    recentContributions,
    strategicPlans,
    activePlan,
  });
}

// POST: Create a new flagship project
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createFlagshipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { fundingSource, strategicPlanId, ...projectData } = parsed.data;

    const { project, flagship } = await createFlagshipProject(
      projectData,
      fundingSource,
      strategicPlanId
    );

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "create_flagship_project",
      targetType: "project",
      targetId: project.id,
      details: JSON.stringify({ title: project.title, fundingSource }),
    });

    return NextResponse.json({ success: true, data: { project, flagship } });
  } catch (error) {
    logError("api/aquifer/admin", error, { userId: session.user.id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
