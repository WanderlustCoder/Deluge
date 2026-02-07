import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { loanQuestionSchema } from "@/lib/validation";
import {
  LOAN_QA_MAX_QUESTIONS_PER_FUNDER,
  LOAN_QA_QUESTION_MAX_CHARS,
} from "@/lib/constants";

// GET: list questions for a loan
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const questions = await prisma.loanQuestion.findMany({
    where: {
      loanId: id,
      hidden: false,
    },
    include: {
      asker: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

// POST: ask a question
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
    const parsed = loanQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify loan exists
    const loan = await prisma.loan.findUnique({
      where: { id },
      select: { id: true, borrowerId: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // Check if user is a funder (has shares in this loan)
    const userShares = await prisma.loanShare.findFirst({
      where: {
        loanId: id,
        funderId: session.user.id,
      },
    });

    if (!userShares) {
      return NextResponse.json(
        { error: "Only funders can ask questions" },
        { status: 403 }
      );
    }

    // Count existing questions from this user
    const existingQuestions = await prisma.loanQuestion.count({
      where: {
        loanId: id,
        askerId: session.user.id,
      },
    });

    if (existingQuestions >= LOAN_QA_MAX_QUESTIONS_PER_FUNDER) {
      return NextResponse.json(
        { error: `You can only ask ${LOAN_QA_MAX_QUESTIONS_PER_FUNDER} questions per loan` },
        { status: 400 }
      );
    }

    // Enforce character limit (should already be handled by validation, but double-check)
    if (parsed.data.question.length > LOAN_QA_QUESTION_MAX_CHARS) {
      return NextResponse.json(
        { error: `Question must be ${LOAN_QA_QUESTION_MAX_CHARS} characters or less` },
        { status: 400 }
      );
    }

    const question = await prisma.loanQuestion.create({
      data: {
        loanId: id,
        askerId: session.user.id,
        question: parsed.data.question,
      },
      include: {
        asker: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    logError("api/loans/questions", error, {
      userId: session.user.id,
      route: `POST /api/loans/${id}/questions`,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
