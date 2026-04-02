"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Loader2, HelpCircle } from "lucide-react";
import type { QuizQuestion, QuizAttempt } from "@/types";

interface QuizPlayerProps {
  lessonId: string;
  courseId: string;
  isEnrolled: boolean;
  onPassed?: () => void;
}

export function QuizPlayer({ lessonId, courseId, isEnrolled, onPassed }: QuizPlayerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({}); // questionId -> optionId
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/quiz?lessonId=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions ?? []);
        setAttempt(data.attempt ?? null);
        if (data.attempt) {
          setResult({
            score: data.attempt.score,
            passed: data.attempt.passed,
            correct: 0,
            total: data.questions?.length ?? 0,
          });
        }
      }
      setLoading(false);
    })();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (Object.keys(selected).length < questions.length) return;
    setSubmitting(true);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId, answers: selected }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
      setAttempt({
        student_id: "",
        lesson_id: lessonId,
        course_id: courseId,
        score: data.score,
        passed: data.passed,
        answers: selected,
        attempted_at: new Date().toISOString(),
      });
      if (data.passed) onPassed?.();
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    setSelected({});
    setResult(null);
    setShowReview(false);
  };

  const threshold = questions[0]?.pass_threshold ?? 70;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading quiz…
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <HelpCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Enroll to take this quiz.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <HelpCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No questions added yet.</p>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="space-y-6">
        <div className={`rounded-xl border p-6 text-center ${result.passed ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
          {result.passed ? (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          ) : (
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          )}
          <p className="text-2xl font-bold mb-1">{result.score}%</p>
          <p className="text-sm text-muted-foreground mb-3">
            {result.passed ? "Passed!" : `Need ${threshold}% to pass`}
          </p>
          {result.passed && (
            <Badge variant="secondary" className="gap-1.5 text-green-600 bg-green-500/10">
              <CheckCircle className="h-3 w-3" /> Lesson completed
            </Badge>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {!result.passed && (
            <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </Button>
          )}
          <Button
            onClick={() => setShowReview((v) => !v)}
            variant="ghost"
            size="sm"
          >
            {showReview ? "Hide review" : "Review answers"}
          </Button>
        </div>

        {/* Answer review */}
        {showReview && (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const chosenId = attempt?.answers?.[q.id];
              const correctOpt = q.options.find((o) => o.is_correct);
              const isCorrect = chosenId === correctOpt?.id;
              return (
                <div key={q.id} className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-medium">
                    {idx + 1}. {q.question}
                    <span className={`ml-2 text-xs font-normal ${isCorrect ? "text-green-500" : "text-destructive"}`}>
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const isChosen = opt.id === chosenId;
                      const isCorrectOpt = opt.is_correct;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            isCorrectOpt
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                              : isChosen && !isCorrectOpt
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {isCorrectOpt ? (
                            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          ) : isChosen ? (
                            <XCircle className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {opt.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Quiz-taking screen
  const answeredCount = Object.keys(selected).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {answeredCount}/{questions.length} answered · Pass mark: {threshold}%
        </p>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-medium">
            {idx + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const isSelected = selected[q.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected((prev) => ({ ...prev, [q.id]: opt.id }))}
                  className={`w-full text-left flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-all ${
                    isSelected
                      ? "border-brand/60 bg-brand/10 text-brand"
                      : "border-border bg-card hover:bg-muted/50 hover:border-foreground/20"
                  }`}
                >
                  <span className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-brand bg-brand" : "border-muted-foreground"
                  }`}>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</>
        ) : !allAnswered ? (
          `Answer all questions (${questions.length - answeredCount} remaining)`
        ) : (
          "Submit Quiz"
        )}
      </Button>
    </div>
  );
}
