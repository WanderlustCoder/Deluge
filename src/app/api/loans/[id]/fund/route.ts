import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { SHARE_PRICE } from "@/lib/constants";

const fundSchema = z.object({
  shares: z.number().int().positive("Must buy at least 1 share"),
});

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
    const parsed = fundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.findUnique({ where: { id } });

    if (!loan || loan.status !== "funding") {
      return NextResponse.json(
        { error: "Loan is not accepting funding." },
        { status: 400 }
      );
    }

    if (loan.borrowerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot fund your own loan." },
        { status: 400 }
      );
    }

    const sharesToBuy = Math.min(parsed.data.shares, loan.sharesRemaining);
    const cost = sharesToBuy * SHARE_PRICE;

    // Check watershed balance
    const watershed = await prisma.watershed.findUnique({
      where: { userId: session.user.id },
    });

    if (!watershed || watershed.balance < cost) {
      return NextResponse.json(
        { error: "Insufficient watershed balance." },
        { status: 400 }
      );
    }

    const newBalance = watershed.balance - cost;
    const newSharesRemaining = loan.sharesRemaining - sharesToBuy;
    const isFullyFunded = newSharesRemaining === 0;

    await prisma.$transaction([
      prisma.loanShare.create({
        data: {
          loanId: id,
          funderId: session.user.id,
          count: sharesToBuy,
          amount: cost,
        },
      }),
      prisma.watershed.update({
        where: { userId: session.user.id },
        data: {
          balance: newBalance,
          totalOutflow: { increment: cost },
        },
      }),
      prisma.watershedTransaction.create({
        data: {
          watershedId: watershed.id,
          type: "loan_funding",
          amount: -cost,
          description: `Funded ${sharesToBuy} loan share${sharesToBuy > 1 ? "s" : ""}: ${loan.purpose}`,
          balanceAfter: newBalance,
        },
      }),
      prisma.loan.update({
        where: { id },
        data: {
          sharesRemaining: newSharesRemaining,
          ...(isFullyFunded && { status: "active" }),
        },
      }),
    ]);

    // If fully funded, credit borrower's watershed
    if (isFullyFunded) {
      const borrowerWatershed = await prisma.watershed.findUnique({
        where: { userId: loan.borrowerId },
      });

      if (borrowerWatershed) {
        const borrowerNewBalance = borrowerWatershed.balance + loan.amount;
        await prisma.$transaction([
          prisma.watershed.update({
            where: { userId: loan.borrowerId },
            data: {
              balance: borrowerNewBalance,
              totalInflow: { increment: loan.amount },
            },
          }),
          prisma.watershedTransaction.create({
            data: {
              watershedId: borrowerWatershed.id,
              type: "loan_disbursement",
              amount: loan.amount,
              description: `Loan funded: ${loan.purpose}`,
              balanceAfter: borrowerNewBalance,
            },
          }),
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sharesBought: sharesToBuy,
        cost,
        newBalance,
        isFullyFunded,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
