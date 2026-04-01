import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Check course exists and is published
  const { data: course } = await supabase
    .from("courses")
    .select("id, is_published, price")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Block free enrollment for paid courses
  if ((course.price ?? 0) > 0) {
    return NextResponse.json({ error: "Payment required to enroll in this course." }, { status: 402 });
  }

  // Idempotent upsert
  const { error } = await supabase
    .from("enrollments")
    .upsert({ student_id: user.id, course_id: courseId }, { onConflict: "student_id,course_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
