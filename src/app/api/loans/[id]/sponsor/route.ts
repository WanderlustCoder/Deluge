import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { createNotification } from "@/lib/notifications";
import { logError } from "@/lib/logger";
import { getTierConfig } from "@/lib/loans";

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
    // Check sponsor role
    const isSponsor = await hasRole(session.user.id, "sponsor");
    if (!isSponsor) {
      return NextResponse.json(
        { error: "You must have the Sponsor role to sponsor loans." },
        { status: 403 }
      );
    }

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { borrower: { select: { creditTier: true } } },
    });

    if (!loan || !loan.seekingSponsor) {
      return NextResponse.json(
        { error: "This loan is not seeking sponsorship." },
        { status: 400 }
      );
    }

    if (loan.borrowerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot sponsor your own loan." },
        { status: 400 }
      );
    }

    // Check if already sponsored
    const existing = await prisma.loanSponsorship.findUnique({
      where: { loanId_sponsorId: { loanId: id, sponsorId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already sponsored this loan." },
        { status: 409 }
      );
    }

    const body = await request.json();
    const message = body.message?.trim() || null;

    // Calculate how much sponsorship is needed
    const tierConfig = getTierConfig(loan.borrower.creditTier);
    const sponsorshipNeeded = Math.max(0, loan.amount - tierConfig.maxAmount);
    const sponsorshipRemaining = sponsorshipNeeded - loan.sponsorshipAmount;
    const sponsorAmount = Math.min(body.amount || sponsorshipRemaining, sponsorshipRemaining);

    if (sponsorAmount <= 0) {
      return NextResponse.json(
        { error: "This loan has sufficient sponsorship." },
        { status: 400 }
      );
    }

    const newSponsorshipTotal = loan.sponsorshipAmount + sponsorAmount;
    const isFullySponsored = newSponsorshipTotal >= sponsorshipNeeded;

    await prisma.$transaction([
      prisma.loanSponsorship.create({
        data: {
          loanId: id,
          sponsorId: session.user.id,
          amount: sponsorAmount,
          message,
        },
      }),
      prisma.loan.update({
        where: { id },
        data: {
          sponsorshipAmount: newSponsorshipTotal,
          ...(isFullySponsored && { seekingSponsor: false }),
        },
      }),
    ]);

    // Notify borrower
    createNotification(
      loan.borrowerId,
      "loan_sponsored",
      "Loan Sponsored!",
      `A sponsor has backed your loan "${loan.purpose}" with $${sponsorAmount.toFixed(2)}.`,
      { link: "/loans/my" }
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        sponsorAmount,
        newSponsorshipTotal,
        isFullySponsored,
      },
    });
  } catch (error) {
    logError("api/loans/sponsor", error, {
      userId: session.user.id,
      route: `POST /api/loans/${id}/sponsor`,
    });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const sponsorships = await prisma.loanSponsorship.findMany({
    where: { loanId: id },
    include: {
      sponsor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sponsorships);
}
