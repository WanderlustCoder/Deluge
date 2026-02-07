import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { LOAN_QA_FLAG_HIDE_THRESHOLD } from "@/lib/constants";

// POST: flag a question as inappropriate
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, qid } = await params;

  try {
    // Verify the question exists and belongs to this loan
    const question = await prisma.loanQuestion.findUnique({
      where: { id: qid },
    });

    if (!question || question.loanId !== id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // User cannot flag their own question
    if (question.askerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot flag your own question" },
        { status: 400 }
      );
    }

    // Increment flag count and auto-hide if threshold reached
    const newFlagCount = question.flagCount + 1;
    const shouldHide = newFlagCount >= LOAN_QA_FLAG_HIDE_THRESHOLD;

    await prisma.loanQuestion.update({
      where: { id: qid },
      data: {
        flagCount: newFlagCount,
        hidden: shouldHide,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        flagCount: newFlagCount,
        hidden: shouldHide,
      },
    });
  } catch (error) {
    logError("api/loans/questions/flag", error, {
      userId: session.user.id,
      route: `POST /api/loans/${id}/questions/${qid}/flag`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
