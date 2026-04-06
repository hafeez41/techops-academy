import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { InstructorHub } from "@/components/instructor/instructor-hub";
import type { Course } from "@/types";

export const metadata = { title: "Instructor Hub" };

export default async function InstructorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "instructor") redirect("/dashboard");

  // Use service client for all queries that read other users' data (enrollments, progress)
  const adminClient = createServiceClient();

  const { data: courses } = await adminClient
    .from("courses")
    .select("*, lessons(count), enrollments(count)")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false });

  const totalStudents = courses?.reduce(
    (acc: number, c: { enrollments: { count: number }[] }) =>
      acc + (c.enrollments?.[0]?.count ?? 0),
    0
  ) ?? 0;

  const totalCourses = courses?.length ?? 0;
  const publishedCourses = courses?.filter((c: { is_published: boolean }) => c.is_published).length ?? 0;

  // Compute avg completion rate across all courses
  let avgCompletionRate = 0;
  if (courses && courses.length > 0) {
    const courseIds = courses.map((c: { id: string }) => c.id);

    const [{ data: allProgress }, { data: allLessons }, { data: allEnrollments }] = await Promise.all([
      adminClient
        .from("progress")
        .select("course_id, student_id, lesson_id")
        .in("course_id", courseIds),
      adminClient
        .from("lessons")
        .select("id, course_id")
        .in("course_id", courseIds),
      adminClient
        .from("enrollments")
        .select("course_id, student_id")
        .in("course_id", courseIds),
    ]);

    // Build lesson count per course
    const lessonCountByCourse: Record<string, number> = {};
    for (const l of allLessons ?? []) {
      lessonCountByCourse[l.course_id] = (lessonCountByCourse[l.course_id] ?? 0) + 1;
    }

    // Build completed lesson count per (course, student)
    const progressByKey: Record<string, number> = {};
    for (const p of allProgress ?? []) {
      const key = `${p.course_id}:${p.student_id}`;
      progressByKey[key] = (progressByKey[key] ?? 0) + 1;
    }

    // For each enrollment compute completion pct (0% if no progress)
    const pcts: number[] = [];
    for (const e of allEnrollments ?? []) {
      const key = `${e.course_id}:${e.student_id}`;
      const completed = progressByKey[key] ?? 0;
      const total = lessonCountByCourse[e.course_id] ?? 0;
      pcts.push(total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0);
    }

    if (pcts.length > 0) {
      avgCompletionRate = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <InstructorHub
        instructorId={user.id}
        courses={(courses ?? []) as (Course & { enrollments: { count: number }[]; lessons: { count: number }[] })[]}
        totalStudents={totalStudents}
        totalCourses={totalCourses}
        publishedCourses={publishedCourses}
        avgCompletionRate={avgCompletionRate}
      />
    </div>
  );
}
