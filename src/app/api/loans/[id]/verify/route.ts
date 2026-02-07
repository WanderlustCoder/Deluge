import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { goalVerificationSchema } from "@/lib/validation";
import { GOAL_VERIFICATION_FLAG_THRESHOLD } from "@/lib/constants";

// GET: get verification status
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const verification = await prisma.goalVerification.findUnique({
    where: { loanId: id },
  });

  if (!verification) {
    return NextResponse.json({ verification: null });
  }

  // Parse JSON fields
  return NextResponse.json({
    verification: {
      ...verification,
      photoUrls: JSON.parse(verification.photoUrls),
      receiptUrls: verification.receiptUrls
        ? JSON.parse(verification.receiptUrls)
        : null,
    },
  });
}

// POST: submit goal verification
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = goalVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify loan exists and user is the borrower
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { goalVerification: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.borrowerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the borrower can submit verification" },
        { status: 403 }
      );
    }

    if (loan.status !== "completed") {
      return NextResponse.json(
        { error: "Verification can only be submitted for completed loans" },
        { status: 400 }
      );
    }

    if (loan.goalVerification) {
      return NextResponse.json(
        { error: "Verification has already been submitted" },
        { status: 400 }
      );
    }

    // Determine verification requirements based on tier
    const minPhotos = loan.tier >= 3 ? 2 : 1;
    const requiresReceipt = loan.tier >= 3;

    if (parsed.data.photoUrls.length < minPhotos) {
      return NextResponse.json(
        { error: `Tier ${loan.tier} requires at least ${minPhotos} photo(s)` },
        { status: 400 }
      );
    }

    if (requiresReceipt && (!parsed.data.receiptUrls || parsed.data.receiptUrls.length === 0)) {
      return NextResponse.json(
        { error: `Tier ${loan.tier} requires receipt documentation` },
        { status: 400 }
      );
    }

    const verification = await prisma.goalVerification.create({
      data: {
        loanId: id,
        photoUrls: JSON.stringify(parsed.data.photoUrls),
        receiptUrls: parsed.data.receiptUrls
          ? JSON.stringify(parsed.data.receiptUrls)
          : null,
        description: parsed.data.description || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...verification,
        photoUrls: parsed.data.photoUrls,
        receiptUrls: parsed.data.receiptUrls,
      },
    });
  } catch (error) {
    logError("api/loans/verify", error, {
      userId: session.user.id,
      route: `POST /api/loans/${id}/verify`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
