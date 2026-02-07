import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { contributeToPool } from "@/lib/aquifer";
import { z } from "zod";
import { logError } from "@/lib/logger";

const contributeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

// POST: User contributes to the Pool
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = contributeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const contribution = await contributeToPool(session.user.id, parsed.data.amount);

    return NextResponse.json({ success: true, data: contribution });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Insufficient")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    logError("api/aquifer/pool/contribute", error, { userId: session.user.id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
