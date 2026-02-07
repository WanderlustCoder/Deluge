import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { DEADLINE_EXTENSION } from "@/lib/constants";

// GET: Check extension eligibility and current status
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        deadlineExtensions: {
          orderBy: { extendedAt: "desc" },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    const extensionCount = loan.deadlineExtensions.length;
    const canExtend =
      loan.status === "funding" &&
      extensionCount < DEADLINE_EXTENSION.maxExtensions;

    return NextResponse.json({
      canExtend,
      extensionCount,
      maxExtensions: DEADLINE_EXTENSION.maxExtensions,
      extensionDays: DEADLINE_EXTENSION.extensionDays,
      currentDeadline: loan.fundingDeadline,
      extensions: loan.deadlineExtensions,
    });
  } catch (error) {
    logError("api/loans/extend-deadline", error, {
      userId: session.user.id,
      loanId: id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Extend the funding deadline (sponsor only)
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
    // Check if user has sponsor role
    const userRoles = await prisma.userRole.findMany({
      where: { userId: session.user.id, isActive: true },
    });

    const isSponsor = userRoles.some((r) => r.role === "sponsor");
    if (!isSponsor) {
      return NextResponse.json(
        { error: "Only sponsors can extend loan deadlines" },
        { status: 403 }
      );
    }

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        deadlineExtensions: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.status !== "funding") {
      return NextResponse.json(
        { error: "Can only extend loans that are still in funding phase" },
        { status: 400 }
      );
    }

    const extensionCount = loan.deadlineExtensions.length;
    if (extensionCount >= DEADLINE_EXTENSION.maxExtensions) {
      return NextResponse.json(
        { error: `Maximum of ${DEADLINE_EXTENSION.maxExtensions} extensions allowed` },
        { status: 400 }
      );
    }

    // Calculate new deadline
    const newDeadline = new Date(loan.fundingDeadline);
    newDeadline.setDate(newDeadline.getDate() + DEADLINE_EXTENSION.extensionDays);

    // Create extension record and update loan
    await prisma.$transaction([
      prisma.loanDeadlineExtension.create({
        data: {
          loanId: id,
          sponsorId: session.user.id,
          extensionDays: DEADLINE_EXTENSION.extensionDays,
        },
      }),
      prisma.loan.update({
        where: { id },
        data: {
          fundingDeadline: newDeadline,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newDeadline,
      extensionCount: extensionCount + 1,
      maxExtensions: DEADLINE_EXTENSION.maxExtensions,
    });
  } catch (error) {
    logError("api/loans/extend-deadline", error, {
      userId: session.user.id,
      loanId: id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
