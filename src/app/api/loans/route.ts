import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  SHARE_PRICE,
  T1_MAX_AMOUNT,
  T1_MAX_MONTHS,
  T1_FUNDING_DEADLINE_DAYS,
  LOAN_CATEGORIES,
} from "@/lib/constants";

const applySchema = z.object({
  amount: z
    .number()
    .positive()
    .max(T1_MAX_AMOUNT, `Maximum loan amount is $${T1_MAX_AMOUNT}`),
  purpose: z.string().min(1, "Purpose is required"),
  purposeCategory: z.enum(LOAN_CATEGORIES as unknown as [string, ...string[]]),
  story: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  repaymentMonths: z
    .number()
    .int()
    .min(1)
    .max(T1_MAX_MONTHS, `Maximum repayment term is ${T1_MAX_MONTHS} months`),
});

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
      _count: { select: { shares: true } },
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
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
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

    const { amount, purpose, purposeCategory, story, location, repaymentMonths } =
      parsed.data;

    const totalShares = Math.ceil(amount / SHARE_PRICE);
    const actualAmount = totalShares * SHARE_PRICE;
    const monthlyPayment = actualAmount / repaymentMonths;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + T1_FUNDING_DEADLINE_DAYS);

    const loan = await prisma.loan.create({
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
        fundingDeadline: deadline,
        repaymentMonths,
        monthlyPayment,
      },
    });

    return NextResponse.json({ success: true, data: loan });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
