import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { CourseBuilder } from "@/components/instructor/course-builder";
import type { Course, Lesson } from "@/types";

export const metadata = { title: "Course Builder" };

export default async function CourseBuilderPage({
  params,
}: {
  params: { courseId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "instructor") redirect("/dashboard");

  // "new" means creating a course
  if (params.courseId === "new") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <CourseBuilder course={null} lessons={[]} userId={user.id} />
      </div>
    );
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.courseId)
    .eq("instructor_id", user.id)
    .single();
  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", params.courseId)
    .order("position", { ascending: true });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <CourseBuilder course={course as Course} lessons={(lessons ?? []) as Lesson[]} userId={user.id} />
    </div>
  );
}
