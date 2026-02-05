import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCronRequest } from "@/lib/cron-auth";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find loans in "funding" status past their deadline
    const expiredLoans = await prisma.loan.findMany({
      where: {
        status: "funding",
        fundingDeadline: { lt: now },
      },
      include: {
        shares: {
          include: {
            funder: {
              include: { watershed: true },
            },
          },
        },
      },
    });

    let expiredCount = 0;

    for (const loan of expiredLoans) {
      const operations = [];

      // Return shares to funders' watersheds
      for (const share of loan.shares) {
        if (share.funder.watershed) {
          const newBalance = share.funder.watershed.balance + share.amount;
          operations.push(
            prisma.watershed.update({
              where: { userId: share.funderId },
              data: {
                balance: newBalance,
                totalOutflow: { decrement: share.amount },
              },
            }),
            prisma.watershedTransaction.create({
              data: {
                watershedId: share.funder.watershed.id,
                type: "loan_refund",
                amount: share.amount,
                description: `Loan expired - refund: ${loan.purpose}`,
                balanceAfter: newBalance,
              },
            })
          );
        }
      }

      // Mark loan as expired
      operations.push(
        prisma.loan.update({
          where: { id: loan.id },
          data: { status: "expired" },
        })
      );

      await prisma.$transaction(operations);
      expiredCount++;
    }

    return NextResponse.json({
      success: true,
      expiredLoans: expiredCount,
    });
  } catch (error) {
    logError("cron/expire-loans", error, { route: "POST /api/cron/expire-loans" });
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
