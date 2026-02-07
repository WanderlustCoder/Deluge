import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { GOAL_VERIFICATION_FLAG_THRESHOLD } from "@/lib/constants";

// POST: flag a verification as suspicious
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify the verification exists
    const verification = await prisma.goalVerification.findUnique({
      where: { loanId: id },
      include: {
        loan: { select: { borrowerId: true } },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // User cannot flag their own verification
    if (verification.loan.borrowerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot flag your own verification" },
        { status: 400 }
      );
    }

    // Check if user is a funder of this loan (only funders can flag)
    const userShares = await prisma.loanShare.findFirst({
      where: {
        loanId: id,
        funderId: session.user.id,
      },
    });

    if (!userShares) {
      return NextResponse.json(
        { error: "Only funders can flag verifications" },
        { status: 403 }
      );
    }

    // Increment flag count and update status if threshold reached
    const newFlagCount = verification.flagCount + 1;
    const shouldFlag = newFlagCount >= GOAL_VERIFICATION_FLAG_THRESHOLD;

    await prisma.goalVerification.update({
      where: { loanId: id },
      data: {
        flagCount: newFlagCount,
        status: shouldFlag ? "flagged" : verification.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        flagCount: newFlagCount,
        status: shouldFlag ? "flagged" : verification.status,
      },
    });
  } catch (error) {
    logError("api/loans/verify/flag", error, {
      userId: session.user.id,
      route: `POST /api/loans/${id}/verify/flag`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
