import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertInstructorAccess } from "@/lib/server-utils";

// POST — unlock a lesson for a student
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, studentId, lessonId } = await req.json();
  if (!courseId || !studentId || !lessonId) {
    return NextResponse.json({ error: "courseId, studentId, and lessonId are required" }, { status: 400 });
  }

  const allowed = await assertInstructorAccess(supabase, courseId, user.id);
  if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { error } = await supabase.from("lesson_unlocks").upsert(
    { student_id: studentId, course_id: courseId, lesson_id: lessonId, unlocked_by: user.id },
    { onConflict: "student_id,lesson_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — lock a lesson back for a student
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, studentId, lessonId } = await req.json();
  if (!courseId || !studentId || !lessonId) {
    return NextResponse.json({ error: "courseId, studentId, and lessonId are required" }, { status: 400 });
  }

  const allowed = await assertInstructorAccess(supabase, courseId, user.id);
  if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const { error } = await supabase
    .from("lesson_unlocks")
    .delete()
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
