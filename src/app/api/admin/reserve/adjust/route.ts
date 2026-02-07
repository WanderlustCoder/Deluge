import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adjustReserve } from "@/lib/reserve";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, description } = body;

  if (typeof amount !== "number" || !description) {
    return NextResponse.json(
      { error: "Amount (number) and description (string) required" },
      { status: 400 }
    );
  }

  const result = await adjustReserve(amount, description);

  logAudit({
    adminId: session.user.id!,
    adminEmail: session.user.email!,
    action: "reserve_adjustment",
    targetType: "reserve",
    details: JSON.stringify({ amount, description, newBalance: result.newBalance }),
  });

  return NextResponse.json({ success: true, newBalance: result.newBalance });
}
