import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { DashboardClient, type CourseProgress } from "@/components/dashboard/dashboard-client";
import type { Enrollment, Lesson } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role === "instructor") redirect("/instructor");
  if (profile?.role === "admin") redirect("/admin");

  const [{ data: enrollments }, { data: progress }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, last_visited_lesson_id, courses(id, title, thumbnail_url, lessons(id, position))")
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("progress")
      .select("lesson_id, course_id, completed_at")
      .eq("student_id", user.id),
  ]);

  const completedLessonIds = new Set(progress?.map((p) => p.lesson_id) ?? []);

  // For each course, find the latest completed_at (certificate date)
  const latestCompletedAt: Record<string, string> = {};
  for (const p of progress ?? []) {
    if (
      p.completed_at &&
      (!latestCompletedAt[p.course_id] || p.completed_at > latestCompletedAt[p.course_id])
    ) {
      latestCompletedAt[p.course_id] = p.completed_at;
    }
  }

  const courses: CourseProgress[] = (enrollments ?? []).map(
    (enrollment: Enrollment & { last_visited_lesson_id: string | null; courses: { id: string; title: string; thumbnail_url: string | null; lessons: Lesson[] } }) => {
      const course = enrollment.courses;
      const lessons: Lesson[] = [...(course?.lessons ?? [])].sort((a, b) => a.position - b.position);
      const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
      const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

      // Resume last visited lesson, or fall back to first incomplete, or first lesson
      const lastVisited = enrollment.last_visited_lesson_id
        ? lessons.find((l) => l.id === enrollment.last_visited_lesson_id)
        : null;
      const nextLesson = lastVisited
        ?? lessons.find((l) => !completedLessonIds.has(l.id))
        ?? lessons[0];

      return {
        enrollmentId: enrollment.id,
        courseId: course?.id ?? "",
        courseTitle: course?.title ?? "",
        thumbnailUrl: course?.thumbnail_url ?? null,
        lessons: lessons.map((l) => ({ id: l.id, position: l.position })),
        completedCount,
        pct,
        nextLessonId: nextLesson?.id ?? null,
        completedAt: pct === 100 ? (latestCompletedAt[course?.id ?? ""] ?? null) : null,
      };
    }
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DashboardClient
          studentName={profile?.full_name ?? "there"}
          courses={courses}
        />
      </main>
    </div>
  );
}
