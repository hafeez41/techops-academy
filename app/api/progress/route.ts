import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, courseId } = await req.json();
  if (!lessonId || !courseId) {
    return NextResponse.json({ error: "lessonId and courseId required" }, { status: 400 });
  }

  // Admins bypass enrollment check
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single();
    if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const { error } = await supabase
    .from("progress")
    .upsert(
      { student_id: user.id, lesson_id: lessonId, course_id: courseId },
      { onConflict: "student_id,lesson_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const { error } = await supabase
    .from("progress")
    .delete()
    .eq("student_id", user.id)
    .eq("lesson_id", lessonId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
