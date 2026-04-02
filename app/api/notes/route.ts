import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId)
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const { data } = await supabase
    .from("lesson_notes")
    .select("content")
    .eq("student_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  return NextResponse.json({ content: data?.content ?? "" });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, courseId, content } = (await req.json()) as {
    lessonId: string;
    courseId: string;
    content: string;
  };

  if (!lessonId || !courseId)
    return NextResponse.json(
      { error: "lessonId and courseId required" },
      { status: 400 }
    );

  await supabase.from("lesson_notes").upsert(
    {
      student_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" }
  );

  return NextResponse.json({ ok: true });
}
