import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHARE_PRICE } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { notifyLoanFunded } from "@/lib/notifications";
import { checkAndUpdateRoles } from "@/lib/roles";
import { loanFundSchema } from "@/lib/validation";
import { hasFundingLock } from "@/lib/watershed-loans";

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
    // Check funding lock
    const locked = await hasFundingLock(session.user.id);
    if (locked) {
      return NextResponse.json(
        { error: "Your watershed funds are locked until your community funders are repaid." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = loanFundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        stretchGoals: { orderBy: { priority: "asc" } },
      },
    });

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

    // Calculate total fundable amount (primary + unfunded stretch goals)
    const stretchTotal = loan.stretchGoals
      .filter((g) => !g.funded)
      .reduce((sum, g) => sum + g.amount, 0);
    const totalStretchShares = Math.ceil(stretchTotal / SHARE_PRICE);
    const maxSharesAvailable = loan.sharesRemaining + totalStretchShares;

    const sharesToBuy = Math.min(parsed.data.shares, maxSharesAvailable);
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

    // Calculate how funding is split between primary and stretch goals
    let remainingShares = sharesToBuy;
    let primarySharesFunded = 0;
    const stretchGoalUpdates: { id: string; funded: boolean }[] = [];
    let additionalLoanAmount = 0;

    // First, fill primary loan
    if (loan.sharesRemaining > 0) {
      primarySharesFunded = Math.min(remainingShares, loan.sharesRemaining);
      remainingShares -= primarySharesFunded;
    }

    // Then fill stretch goals in priority order
    if (remainingShares > 0 && loan.stretchGoals.length > 0) {
      for (const goal of loan.stretchGoals) {
        if (goal.funded || remainingShares <= 0) continue;

        const goalShares = Math.ceil(goal.amount / SHARE_PRICE);
        if (remainingShares >= goalShares) {
          stretchGoalUpdates.push({ id: goal.id, funded: true });
          additionalLoanAmount += goal.amount;
          remainingShares -= goalShares;
        }
      }
    }

    const newSharesRemaining = loan.sharesRemaining - primarySharesFunded;
    const isFullyFunded = newSharesRemaining === 0;

    // If stretch goals were funded, update the loan amount
    const newLoanAmount = loan.amount + additionalLoanAmount;
    const newTotalShares = loan.totalShares + Math.ceil(additionalLoanAmount / SHARE_PRICE);

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
          amount: newLoanAmount,
          totalShares: newTotalShares,
          monthlyPayment: newLoanAmount / loan.repaymentMonths,
          ...(isFullyFunded && { status: "active" }),
        },
      }),
      // Update funded stretch goals
      ...stretchGoalUpdates.map((update) =>
        prisma.loanStretchGoal.update({
          where: { id: update.id },
          data: { funded: true },
        })
      ),
    ]);

    // If fully funded (primary), credit borrower's watershed
    if (isFullyFunded) {
      const borrowerWatershed = await prisma.watershed.findUnique({
        where: { userId: loan.borrowerId },
      });

      if (borrowerWatershed) {
        const borrowerNewBalance = borrowerWatershed.balance + newLoanAmount;
        await prisma.$transaction([
          prisma.watershed.update({
            where: { userId: loan.borrowerId },
            data: {
              balance: borrowerNewBalance,
              totalInflow: { increment: newLoanAmount },
            },
          }),
          prisma.watershedTransaction.create({
            data: {
              watershedId: borrowerWatershed.id,
              type: "loan_disbursement",
              amount: newLoanAmount,
              description: `Loan funded: ${loan.purpose}${stretchGoalUpdates.length > 0 ? ` (+${stretchGoalUpdates.length} stretch goal${stretchGoalUpdates.length > 1 ? "s" : ""})` : ""}`,
              balanceAfter: borrowerNewBalance,
            },
          }),
        ]);
      }

      notifyLoanFunded(loan.borrowerId, loan.purpose).catch(() => {});
    }

    // Check if funder earns new platform roles
    checkAndUpdateRoles(session.user.id).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        sharesBought: sharesToBuy,
        cost,
        newBalance,
        isFullyFunded,
        stretchGoalsFunded: stretchGoalUpdates.length,
      },
    });
  } catch (error) {
    logError("api/loans/fund", error, { userId: session.user.id, route: `POST /api/loans/${id}/fund` });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
