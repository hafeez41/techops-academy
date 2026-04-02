import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getRequestKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit: 10 enrollment attempts per minute per IP
  const rl = rateLimit(getRequestKey(req, "enroll"), { limit: 10, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

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

  // Check prerequisites: student must have completed all required courses
  const { data: prerequisites } = await supabase
    .from("course_prerequisites")
    .select("prerequisite_id")
    .eq("course_id", courseId);

  if (prerequisites && prerequisites.length > 0) {
    const prereqIds = prerequisites.map((p) => p.prerequisite_id);

    // For each prerequisite, check the student has 100% progress
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", user.id)
      .in("course_id", prereqIds);

    const enrolledPrereqIds = new Set(enrollments?.map((e) => e.course_id) ?? []);
    const missingEnrollments = prereqIds.filter((id) => !enrolledPrereqIds.has(id));

    if (missingEnrollments.length > 0) {
      // Fetch titles for clearer error
      const { data: missingCourses } = await supabase
        .from("courses")
        .select("title")
        .in("id", missingEnrollments);
      const titles = (missingCourses ?? []).map((c) => c.title).join(", ");
      return NextResponse.json(
        { error: `You must complete the following courses first: ${titles}` },
        { status: 403 }
      );
    }

    // Check progress for enrolled prerequisites
    for (const prereqId of prereqIds) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", prereqId);
      const { data: progress } = await supabase
        .from("progress")
        .select("lesson_id")
        .eq("student_id", user.id)
        .eq("course_id", prereqId);

      const lessonCount = lessons?.length ?? 0;
      const completedCount = progress?.length ?? 0;
      if (lessonCount > 0 && completedCount < lessonCount) {
        const { data: prereqCourse } = await supabase
          .from("courses")
          .select("title")
          .eq("id", prereqId)
          .single();
        return NextResponse.json(
          { error: `Complete "${prereqCourse?.title ?? "a prerequisite course"}" before enrolling.` },
          { status: 403 }
        );
      }
    }
  }

  // Idempotent upsert
  const { error } = await supabase
    .from("enrollments")
    .upsert({ student_id: user.id, course_id: courseId }, { onConflict: "student_id,course_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
