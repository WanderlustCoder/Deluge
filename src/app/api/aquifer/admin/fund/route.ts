import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { contributeFromDeluge, fundFromReserve } from "@/lib/aquifer";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { logError } from "@/lib/logger";

const addFundsSchema = z.object({
  type: z.enum(["reserve", "pool"]),
  amount: z.number().positive("Amount must be positive"),
  note: z.string().optional(),
});

const fundProjectSchema = z.object({
  flagshipId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
});

// POST: CFO adds funds to Reserve or Pool
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if this is a fund project request or add funds request
    if (body.flagshipId) {
      const parsed = fundProjectSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0].message },
          { status: 400 }
        );
      }

      const result = await fundFromReserve(parsed.data.flagshipId, parsed.data.amount);

      logAudit({
        adminId: session.user.id,
        adminEmail: session.user.email!,
        action: "fund_flagship_from_reserve",
        targetType: "flagship",
        targetId: parsed.data.flagshipId,
        details: JSON.stringify({ amount: parsed.data.amount, funded: result.funded }),
      });

      return NextResponse.json({ success: true, data: result });
    }

    // Regular add funds
    const parsed = addFundsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type, amount, note } = parsed.data;
    const result = await contributeFromDeluge(type, amount, note);

    logAudit({
      adminId: session.user.id,
      adminEmail: session.user.email!,
      action: "add_aquifer_funds",
      targetType: "aquifer",
      targetId: result.aquifer.id,
      details: JSON.stringify({ type, amount, note }),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    logError("api/aquifer/admin/fund", error, { userId: session.user.id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
