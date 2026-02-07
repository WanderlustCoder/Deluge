import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { loanAnswerSchema } from "@/lib/validation";

// GET: get a specific question
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { qid } = await params;

  const question = await prisma.loanQuestion.findUnique({
    where: { id: qid },
    include: {
      asker: { select: { id: true, name: true } },
    },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question);
}

// PATCH: borrower answers a question
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, qid } = await params;

  try {
    const body = await request.json();
    const parsed = loanAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify the loan and that user is the borrower
    const loan = await prisma.loan.findUnique({
      where: { id },
      select: { borrowerId: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    if (loan.borrowerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the borrower can answer questions" },
        { status: 403 }
      );
    }

    // Get the question
    const question = await prisma.loanQuestion.findUnique({
      where: { id: qid },
    });

    if (!question || question.loanId !== id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (question.answer) {
      return NextResponse.json(
        { error: "This question has already been answered" },
        { status: 400 }
      );
    }

    const updated = await prisma.loanQuestion.update({
      where: { id: qid },
      data: {
        answer: parsed.data.answer,
        answeredAt: new Date(),
      },
      include: {
        asker: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logError("api/loans/questions/answer", error, {
      userId: session.user.id,
      route: `PATCH /api/loans/${id}/questions/${qid}`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
