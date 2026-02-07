import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAtRiskLoans } from "@/lib/default-recovery";
import { logError } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  if (session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const atRiskLoans = await getAtRiskLoans();

    // Group by status
    const grouped = {
      late: atRiskLoans.filter((l) => l.healthStatus === "late"),
      at_risk: atRiskLoans.filter((l) => l.healthStatus === "at_risk"),
      defaulted: atRiskLoans.filter((l) => l.healthStatus === "defaulted"),
      recovering: atRiskLoans.filter((l) => l.healthStatus === "recovering"),
    };

    return NextResponse.json({
      loans: atRiskLoans,
      grouped,
      summary: {
        total: atRiskLoans.length,
        late: grouped.late.length,
        atRisk: grouped.at_risk.length,
        defaulted: grouped.defaulted.length,
        recovering: grouped.recovering.length,
      },
    });
  } catch (error) {
    logError("api/admin/loans/at-risk", error, {
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
