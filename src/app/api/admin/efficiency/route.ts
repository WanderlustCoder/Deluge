import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// GET: Admin view of all efficiency applications
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accountType: true },
  });
  if (user?.accountType !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const homes = await prisma.efficiencyHome.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assessment: {
          select: {
            efficiencyScore: true,
            totalEstimatedCost: true,
            projectedSavingsKwh: true,
            projectedCo2Reduction: true,
          },
        },
        phases: {
          select: { id: true, phaseNumber: true, status: true, estimatedCost: true, amountFunded: true },
          orderBy: { phaseNumber: "asc" },
        },
        neighborhoodBatch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const nominations = await prisma.efficiencyNomination.findMany({
      where: { status: { in: ["pending", "voting"] } },
      include: {
        nominator: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const cascades = await prisma.neighborhoodCascade.findMany({
      include: {
        homes: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const totalHomes = homes.length;
    const applied = homes.filter(h => h.status === "applied").length;
    const assessed = homes.filter(h => h.status === "assessed").length;
    const funding = homes.filter(h => h.status === "funding").length;
    const inProgress = homes.filter(h => h.status === "in_progress").length;
    const completed = homes.filter(h => h.status === "completed").length;
    const totalEstimatedCost = homes.reduce((s, h) => s + (h.assessment?.totalEstimatedCost || 0), 0);
    const totalFunded = homes.reduce((s, h) => s + h.phases.reduce((ps, p) => ps + p.amountFunded, 0), 0);

    return NextResponse.json({
      homes,
      nominations,
      cascades,
      stats: {
        totalHomes,
        applied,
        assessed,
        funding,
        inProgress,
        completed,
        totalEstimatedCost,
        totalFunded,
        pendingNominations: nominations.length,
        activeCascades: cascades.filter(c => ["forming", "triggered", "funding", "in_progress"].includes(c.status)).length,
      },
    });
  } catch (error) {
    logError("api/admin/efficiency", error, { userId: session.user.id });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
