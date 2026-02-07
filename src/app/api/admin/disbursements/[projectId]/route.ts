import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { triggerDisbursement } from "@/lib/disbursement";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  let source: string | undefined;
  let notes: string | undefined;
  try {
    const body = await request.json();
    source = body.source;
    notes = body.notes;
  } catch {
    // No body
  }

  try {
    const disbursement = await triggerDisbursement(projectId, {
      source,
      initiatedBy: session.user.id!,
      notes,
    });

    if (!disbursement) {
      return NextResponse.json(
        { error: "No pledged allocations to disburse" },
        { status: 400 }
      );
    }

    logAudit({
      adminId: session.user.id!,
      adminEmail: session.user.email!,
      action: "disbursement_triggered",
      targetType: "project",
      targetId: projectId,
      details: JSON.stringify({
        amount: disbursement.amount,
        source: disbursement.source,
      }),
    });

    return NextResponse.json({ success: true, disbursement });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disbursement failed" },
      { status: 500 }
    );
  }
}
