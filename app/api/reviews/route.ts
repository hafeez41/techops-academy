import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, rating, body } = await req.json();
  if (!courseId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Must be enrolled to review
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment) {
    return NextResponse.json({ error: "You must be enrolled to leave a review" }, { status: 403 });
  }

  const { error } = await supabase
    .from("reviews")
    .upsert(
      { student_id: user.id, course_id: courseId, rating, body: body?.trim() || null },
      { onConflict: "student_id,course_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
