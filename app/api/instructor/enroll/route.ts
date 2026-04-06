import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { rateLimit, getRequestKey } from "@/lib/rate-limit";
import { assertInstructorAccess } from "@/lib/server-utils";

// GET — list enrolled students with progress and unlock data
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const progressionMode = searchParams.get("progressionMode");
  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

  const allowed = await assertInstructorAccess(supabase, courseId, user.id);
  if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const adminClient = createServiceClient();

  const { data: enrollments, error: enrollError } = await adminClient
    .from("enrollments")
    .select("student_id, enrolled_at, enrolled_by")
    .eq("course_id", courseId);

  if (enrollError) return NextResponse.json({ error: enrollError.message }, { status: 500 });
  if (!enrollments?.length) return NextResponse.json({ enrollments: [], progress: [], unlocks: [] });

  const studentIds = enrollments.map((e) => e.student_id);

  const [{ data: profiles }, { data: progressRows }, { data: unlocks }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds),
    adminClient
      .from("progress")
      .select("student_id, lesson_id")
      .eq("course_id", courseId)
      .in("student_id", studentIds),
    progressionMode === "instructor_gated"
      ? adminClient
          .from("lesson_unlocks")
          .select("student_id, lesson_id")
          .eq("course_id", courseId)
          .in("student_id", studentIds)
      : Promise.resolve({ data: [] }),
  ]);

  // Merge profile data into enrollments
  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, { full_name: p.full_name, email: p.email }])
  );
  const enrichedEnrollments = enrollments.map((e) => ({
    ...e,
    profiles: profileMap[e.student_id] ?? null,
  }));

  return NextResponse.json({
    enrollments: enrichedEnrollments,
    progress: progressRows ?? [],
    unlocks: unlocks ?? [],
  });
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

  const adminClient = createServiceClient();
  const { error } = await adminClient.from("enrollments").upsert(
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

  const adminClient = createServiceClient();
  await Promise.all([
    adminClient.from("enrollments").delete().eq("student_id", studentId).eq("course_id", courseId),
    adminClient.from("lesson_unlocks").delete().eq("student_id", studentId).eq("course_id", courseId),
  ]);

  return NextResponse.json({ success: true });
}
