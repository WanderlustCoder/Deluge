import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHARE_PRICE, WATERSHED_LOAN_MIN_AMOUNT } from "@/lib/constants";
import { getTierConfig } from "@/lib/loans";
import { logError } from "@/lib/logger";
import { loanApplySchema } from "@/lib/validation";

// GET: list loans in funding status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loans = await prisma.loan.findMany({
    where: { status: "funding" },
    include: {
      borrower: { select: { name: true } },
      stretchGoals: { orderBy: { priority: "asc" } },
      _count: { select: { shares: true, sponsorships: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(loans);
}

// POST: apply for a loan
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = loanApplySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Get user's credit tier for dynamic limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditTier: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const tierConfig = getTierConfig(user.creditTier);

    // Enforce $100 minimum for all loans
    if (parsed.data.amount < WATERSHED_LOAN_MIN_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum loan amount is $${WATERSHED_LOAN_MIN_AMOUNT}.` },
        { status: 400 }
      );
    }

    // Check if loan exceeds credit limit — if so, mark as seeking sponsor
    const needsSponsor = parsed.data.amount > tierConfig.maxAmount;

    if (parsed.data.repaymentMonths > tierConfig.maxMonths) {
      return NextResponse.json(
        { error: `Maximum repayment term for Tier ${user.creditTier} is ${tierConfig.maxMonths} months.` },
        { status: 400 }
      );
    }

    // Check if user already has an active loan
    const existingLoan = await prisma.loan.findFirst({
      where: {
        borrowerId: session.user.id,
        status: { in: ["funding", "active", "repaying"] },
      },
    });

    if (existingLoan) {
      return NextResponse.json(
        { error: "You already have an active loan." },
        { status: 400 }
      );
    }

    // Check if user has unverified completed loans
    const unverifiedLoan = await prisma.loan.findFirst({
      where: {
        borrowerId: session.user.id,
        status: "completed",
        goalVerification: null,
      },
    });

    if (unverifiedLoan) {
      return NextResponse.json(
        { error: "Please verify your previous loan's goal before applying for a new one." },
        { status: 400 }
      );
    }

    const { amount, purpose, purposeCategory, story, location, repaymentMonths, stretchGoals } =
      parsed.data;

    const totalShares = Math.ceil(amount / SHARE_PRICE);
    const actualAmount = totalShares * SHARE_PRICE;
    const monthlyPayment = actualAmount / repaymentMonths;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + tierConfig.deadlineDays);

    // Create loan with stretch goals in a transaction
    const loan = await prisma.$transaction(async (tx) => {
      const newLoan = await tx.loan.create({
        data: {
          borrowerId: session.user.id,
          amount: actualAmount,
          totalShares,
          sharesRemaining: totalShares,
          purpose,
          purposeCategory,
          story: story || null,
          location,
          status: "funding",
          tier: user.creditTier,
          fundingDeadline: deadline,
          repaymentMonths,
          monthlyPayment,
          seekingSponsor: needsSponsor,
        },
      });

      // Create stretch goals if provided
      if (stretchGoals && stretchGoals.length > 0) {
        await tx.loanStretchGoal.createMany({
          data: stretchGoals.map((goal) => ({
            loanId: newLoan.id,
            priority: goal.priority,
            amount: goal.amount,
            purpose: goal.purpose,
          })),
        });
      }

      return newLoan;
    });

    // Fetch the loan with stretch goals
    const loanWithGoals = await prisma.loan.findUnique({
      where: { id: loan.id },
      include: { stretchGoals: { orderBy: { priority: "asc" } } },
    });

    return NextResponse.json({ success: true, data: loanWithGoals });
  } catch (error) {
    logError("api/loans", error, { userId: session.user.id, route: "POST /api/loans" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
