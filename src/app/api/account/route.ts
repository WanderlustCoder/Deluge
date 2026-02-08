import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { updateNameSchema } from "@/lib/validation";
import { getTierName, getTierConfig } from "@/lib/loans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const [user, platformRoles, adViewCount, adCreditsAgg, contributionAgg, allocationAgg, projectsFunded] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.userRole.findMany({
          where: { userId, isActive: true },
          select: { role: true, grantedAt: true },
        }),
        prisma.adView.count({ where: { userId } }),
        prisma.adView.aggregate({
          where: { userId },
          _sum: { watershedCredit: true },
        }),
        prisma.contribution.aggregate({
          where: { userId },
          _sum: { watershedCredit: true },
        }),
        prisma.allocation.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),
        prisma.allocation.groupBy({
          by: ["projectId"],
          where: { userId },
        }),
      ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tierConfig = getTierConfig(user.creditTier);

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        creditTier: user.creditTier,
        createdAt: user.createdAt.toISOString(),
      },
      platformRoles: platformRoles.map((pr) => ({
        role: pr.role,
        grantedAt: pr.grantedAt.toISOString(),
      })),
      stats: {
        adViewCount,
        totalAdCredits: adCreditsAgg._sum.watershedCredit ?? 0,
        totalContributions: contributionAgg._sum.watershedCredit ?? 0,
        totalDeployed: allocationAgg._sum.amount ?? 0,
        projectCount: projectsFunded.length,
      },
      tierInfo: {
        name: getTierName(user.creditTier),
        maxAmount: tierConfig.maxAmount,
        maxMonths: tierConfig.maxMonths,
      },
    });
  } catch (error) {
    logError("api/account", error, { userId, route: "GET /api/account" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateNameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
    });

    return NextResponse.json({
      success: true,
      data: { name: user.name },
    });
  } catch (error) {
    logError("api/account", error, { userId: session.user.id, route: "PATCH /api/account" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
