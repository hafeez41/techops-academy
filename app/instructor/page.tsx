import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const { data: courses } = await supabase
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <InstructorHub
        instructorId={user.id}
        courses={(courses ?? []) as (Course & { enrollments: { count: number }[]; lessons: { count: number }[] })[]}
        totalStudents={totalStudents}
        totalCourses={totalCourses}
        publishedCourses={publishedCourses}
      />
    </div>
  );
}
