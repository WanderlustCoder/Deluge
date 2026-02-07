"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Flag, Send } from "lucide-react";
import {
  LOAN_QA_MAX_QUESTIONS_PER_FUNDER,
  LOAN_QA_QUESTION_MAX_CHARS,
} from "@/lib/constants";

interface LoanQuestion {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  asker: { id: string; name: string };
}

interface LoanQAProps {
  loanId: string;
  questions: LoanQuestion[];
  isBorrower: boolean;
  isFunder: boolean;
  currentUserId: string | null;
  onUpdate: () => void;
}

export function LoanQA({
  loanId,
  questions,
  isBorrower,
  isFunder,
  currentUserId,
  onUpdate,
}: LoanQAProps) {
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState("");
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  // Count how many questions current user has asked
  const userQuestionCount = questions.filter(
    (q) => q.asker.id === currentUserId
  ).length;
  const canAskMore = isFunder && userQuestionCount < LOAN_QA_MAX_QUESTIONS_PER_FUNDER;

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/loans/${loanId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Failed to post question", "error");
      return;
    }

    toast("Question posted!", "success");
    setNewQuestion("");
    onUpdate();
  }

  async function handleAnswer(questionId: string) {
    const answer = answerText[questionId];
    if (!answer?.trim()) return;

    setAnsweringId(questionId);
    const res = await fetch(`/api/loans/${loanId}/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    const data = await res.json();
    setAnsweringId(null);

    if (!res.ok) {
      toast(data.error || "Failed to post answer", "error");
      return;
    }

    toast("Answer posted!", "success");
    setAnswerText({ ...answerText, [questionId]: "" });
    onUpdate();
  }

  async function handleFlag(questionId: string) {
    const res = await fetch(`/api/loans/${loanId}/questions/${questionId}/flag`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.error || "Failed to flag question", "error");
      return;
    }

    toast("Question flagged. Thank you for helping keep the community safe.", "success");
    onUpdate();
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <h3 className="font-heading font-semibold text-storm dark:text-white mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-ocean" />
          Questions & Answers
          {questions.length > 0 && (
            <span className="text-sm font-normal text-storm-light dark:text-gray-400">
              ({questions.length})
            </span>
          )}
        </h3>

        {/* Ask Question Form - only for funders */}
        {canAskMore && (
          <form onSubmit={handleAskQuestion} className="mb-6">
            <div className="relative">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                maxLength={LOAN_QA_QUESTION_MAX_CHARS}
                rows={2}
                placeholder="Ask the borrower a question..."
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
              />
              <Button
                type="submit"
                size="sm"
                loading={loading}
                disabled={!newQuestion.trim()}
                className="absolute bottom-2 right-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-storm-light dark:text-gray-400">
                {LOAN_QA_MAX_QUESTIONS_PER_FUNDER - userQuestionCount} question{LOAN_QA_MAX_QUESTIONS_PER_FUNDER - userQuestionCount !== 1 ? "s" : ""} remaining
              </p>
              <p className="text-xs text-storm-light dark:text-gray-400">
                {newQuestion.length}/{LOAN_QA_QUESTION_MAX_CHARS}
              </p>
            </div>
          </form>
        )}

        {isFunder && !canAskMore && userQuestionCount >= LOAN_QA_MAX_QUESTIONS_PER_FUNDER && (
          <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
            You&apos;ve used all {LOAN_QA_MAX_QUESTIONS_PER_FUNDER} questions for this loan.
          </p>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <p className="text-sm text-storm-light dark:text-gray-400 text-center py-4">
            No questions yet.
            {isFunder && " Be the first to ask!"}
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-storm dark:text-white">
                        {q.asker.name}
                      </span>
                      <span className="text-xs text-storm-light dark:text-gray-400">
                        {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-storm dark:text-gray-300">{q.question}</p>
                  </div>
                  {currentUserId && q.asker.id !== currentUserId && (
                    <button
                      onClick={() => handleFlag(q.id)}
                      className="text-storm-light hover:text-red-500 transition-colors p-1"
                      title="Flag inappropriate question"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className="mt-3 pl-4 border-l-2 border-teal">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-teal">
                        Borrower&apos;s Response
                      </span>
                      {q.answeredAt && (
                        <span className="text-xs text-storm-light dark:text-gray-400">
                          {formatDistanceToNow(new Date(q.answeredAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-storm dark:text-gray-300">{q.answer}</p>
                  </div>
                ) : isBorrower ? (
                  <div className="mt-3">
                    <textarea
                      value={answerText[q.id] || ""}
                      onChange={(e) =>
                        setAnswerText({ ...answerText, [q.id]: e.target.value })
                      }
                      rows={2}
                      placeholder="Write your response..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal resize-none"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => handleAnswer(q.id)}
                      loading={answeringId === q.id}
                      disabled={!answerText[q.id]?.trim()}
                    >
                      Post Answer
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-storm-light dark:text-gray-400 mt-2 italic">
                    Awaiting response from borrower
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
