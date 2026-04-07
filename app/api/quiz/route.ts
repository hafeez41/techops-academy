import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertInstructorAccess } from "@/lib/server-utils";

// GET /api/quiz?lessonId= — fetch questions + options + student's last attempt
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: questions }, { data: attempt }] = await Promise.all([
    supabase
      .from("quiz_questions")
      .select("*, quiz_options(*)")
      .eq("lesson_id", lessonId)
      .order("position", { ascending: true }),
    supabase
      .from("quiz_attempts")
      .select("*")
      .eq("student_id", user.id)
      .eq("lesson_id", lessonId)
      .single(),
  ]);

  // Sort options by position
  const sortedQuestions = (questions ?? []).map((q) => ({
    ...q,
    options: (q.quiz_options ?? []).sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ),
  }));

  return NextResponse.json({
    questions: sortedQuestions,
    attempt: attempt ?? null,
  });
}

// POST /api/quiz — submit answers, calculate score, upsert attempt
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, courseId, answers } = await req.json();
  // answers: { [questionId]: optionId }
  if (!lessonId || !courseId || !answers) {
    return NextResponse.json({ error: "lessonId, courseId and answers required" }, { status: 400 });
  }

  // Fetch questions + correct options
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, pass_threshold, quiz_options(id, is_correct)")
    .eq("lesson_id", lessonId);

  if (!questions?.length) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  let correct = 0;
  for (const q of questions) {
    const chosen = answers[q.id];
    const correctOption = (q.quiz_options ?? []).find(
      (o: { id: string; is_correct: boolean }) => o.is_correct
    );
    if (correctOption && chosen === correctOption.id) correct++;
  }

  const score = Math.round((correct / questions.length) * 100);
  const threshold = questions[0]?.pass_threshold ?? 70;
  const passed = score >= threshold;

  // Upsert attempt
  const { error: attemptError } = await supabase.from("quiz_attempts").upsert(
    {
      student_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      score,
      passed,
      answers,
      attempted_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" }
  );
  if (attemptError) return NextResponse.json({ error: attemptError.message }, { status: 500 });

  // Auto-mark lesson complete if passed
  if (passed) {
    const { error: progressError } = await supabase.from("progress").upsert(
      { student_id: user.id, lesson_id: lessonId, course_id: courseId },
      { onConflict: "student_id,lesson_id" }
    );
    if (progressError) return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  return NextResponse.json({ score, passed, correct, total: questions.length });
}

// PUT /api/quiz — instructor saves questions (replaces all for the lesson)
export async function PUT(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, courseId, questions } = await req.json();
  if (!lessonId || !courseId || !Array.isArray(questions)) {
    return NextResponse.json({ error: "lessonId, courseId and questions required" }, { status: 400 });
  }

  // Verify instructor/admin access
  const hasAccess = await assertInstructorAccess(supabase, courseId, user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Delete existing questions (cascade deletes options + attempts)
  await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId);

  // Re-insert questions in parallel — each question's options depend on its
  // inserted ID so we parallelize at the question level, not option level.
  type QuizOption = { text: string; is_correct: boolean };
  type QuizQuestion = { question: string; pass_threshold?: number; options?: QuizOption[] };

  await Promise.all(
    (questions as QuizQuestion[]).map(async (q, i) => {
      const { data: inserted } = await supabase
        .from("quiz_questions")
        .insert({
          lesson_id: lessonId,
          course_id: courseId,
          question: q.question,
          position: i,
          pass_threshold: q.pass_threshold ?? 70,
        })
        .select("id")
        .single();

      if (inserted && q.options?.length) {
        await supabase.from("quiz_options").insert(
          q.options.map((opt, j) => ({
            question_id: inserted.id,
            text: opt.text,
            is_correct: opt.is_correct,
            position: j,
          }))
        );
      }
    })
  );

  return NextResponse.json({ success: true });
}
