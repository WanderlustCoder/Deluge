import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { clearSettlement } from "@/lib/settlement";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let providerRef: string | undefined;
  try {
    const body = await request.json();
    providerRef = body.providerRef;
  } catch {
    // No body
  }

  const settlement = await clearSettlement(id, providerRef);

  if (!settlement) {
    return NextResponse.json(
      { error: "Settlement not found or already cleared" },
      { status: 404 }
    );
  }

  logAudit({
    adminId: session.user.id!,
    adminEmail: session.user.email!,
    action: "settlement_cleared",
    targetType: "settlement",
    targetId: id,
    details: JSON.stringify({ providerRef }),
  });

  return NextResponse.json({ success: true, settlement });
}
