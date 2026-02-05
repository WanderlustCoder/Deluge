import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      borrower: { select: { name: true } },
      shares: {
        include: { funder: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      repayments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  return NextResponse.json(loan);
}
