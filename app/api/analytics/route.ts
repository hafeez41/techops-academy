import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// GET /api/analytics?instructorId=  (instructorId optional — omit for admin/all-courses view)
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (!role || role === "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get("instructorId");

  // Instructors can only see their own courses
  if (role === "instructor" && instructorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createServiceClient();

  let q = adminClient
    .from("courses")
    .select("id, title, is_published, instructor_id, profiles(full_name), lessons(id, title, position)")
    .order("created_at", { ascending: false });

  if (instructorId) q = q.eq("instructor_id", instructorId);

  const { data: rawCourses, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rawCourses?.length) return NextResponse.json({ courses: [], enrollments: [], progress: [] });

  const courseIds = rawCourses.map((c: { id: string }) => c.id);

  const [{ data: enrollments }, { data: progressData }] = await Promise.all([
    adminClient.from("enrollments").select("course_id, student_id").in("course_id", courseIds),
    adminClient.from("progress").select("lesson_id, course_id, student_id").in("course_id", courseIds),
  ]);

  return NextResponse.json({
    courses: rawCourses,
    enrollments: enrollments ?? [],
    progress: progressData ?? [],
  });
}
