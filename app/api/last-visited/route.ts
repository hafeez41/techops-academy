import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/last-visited — update last_visited_lesson_id on an enrollment
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, lessonId } = await req.json();
  if (!courseId || !lessonId) {
    return NextResponse.json({ error: "courseId and lessonId required" }, { status: 400 });
  }

  await supabase
    .from("enrollments")
    .update({ last_visited_lesson_id: lessonId })
    .eq("student_id", user.id)
    .eq("course_id", courseId);

  return NextResponse.json({ success: true });
}
