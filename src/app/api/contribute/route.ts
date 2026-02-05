import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkFirstActionReferral } from "@/lib/referrals";
import { checkAndAwardBadges } from "@/lib/badges";
import { logError } from "@/lib/logger";
import { contributeSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const parsed = contributeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, type } = parsed.data;

    // Get or create watershed
    let watershed = await prisma.watershed.findUnique({
      where: { userId },
    });

    if (!watershed) {
      watershed = await prisma.watershed.create({
        data: { userId },
      });
    }

    const newBalance = watershed.balance + amount;
    const newInflow = watershed.totalInflow + amount;

    await prisma.$transaction([
      prisma.contribution.create({
        data: {
          userId,
          amount,
          type,
          watershedCredit: amount,
        },
      }),
      prisma.watershed.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalInflow: newInflow,
        },
      }),
      prisma.watershedTransaction.create({
        data: {
          watershedId: watershed.id,
          type: "cash_contribution",
          amount,
          description:
            type === "cash"
              ? "Cash contribution"
              : "Simulated contribution",
          balanceAfter: newBalance,
        },
      }),
    ]);

    // Check badges + referral milestone
    const newBadges = await checkAndAwardBadges(userId);
    checkFirstActionReferral(userId).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        amount,
        newBalance,
        type,
        newBadges,
      },
    });
  } catch (error) {
    logError("api/contribute", error, { userId, route: "POST /api/contribute" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
