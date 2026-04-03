import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getRequestKey } from "@/lib/rate-limit";

async function assertInstructorAccess(
  supabase: ReturnType<typeof createClient>,
  courseId: string,
  userId: string
) {
  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).single(),
    supabase.from("courses").select("id, instructor_id").eq("id", courseId).single(),
  ]);
  if (!course) return false;
  if (profile?.role === "admin") return true;
  return course.instructor_id === userId;
}

// POST — enroll a student by email
export async function POST(req: Request) {
  const { success } = rateLimit(getRequestKey(req, "inst-enroll"), { limit: 20, windowMs: 60_000 });
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, email } = await req.json();
  if (!courseId || !email) {
    return NextResponse.json({ error: "courseId and email are required" }, { status: 400 });
  }

  const allowed = await assertInstructorAccess(supabase, courseId, user.id);
  if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  // Resolve student ID from email via SECURITY DEFINER function
  const { data: studentId, error: lookupError } = await supabase
    .rpc("get_user_id_by_email", { p_email: email })
    .single();

  if (lookupError || !studentId) {
    return NextResponse.json(
      { error: "No account found for that email address." },
      { status: 404 }
    );
  }

  const { error } = await supabase.from("enrollments").upsert(
    { student_id: studentId as string, course_id: courseId, enrolled_by: user.id },
    { onConflict: "student_id,course_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, studentId });
}

// DELETE — remove a student's enrollment (and their lesson unlocks)
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, studentId } = await req.json();
  if (!courseId || !studentId) {
    return NextResponse.json({ error: "courseId and studentId are required" }, { status: 400 });
  }

  const allowed = await assertInstructorAccess(supabase, courseId, user.id);
  if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  await Promise.all([
    supabase.from("enrollments").delete().eq("student_id", studentId).eq("course_id", courseId),
    supabase.from("lesson_unlocks").delete().eq("student_id", studentId).eq("course_id", courseId),
  ]);

  return NextResponse.json({ success: true });
}
