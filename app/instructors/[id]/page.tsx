import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { CourseCard } from "@/components/shared/course-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users } from "lucide-react";
import type { Course } from "@/types";

export default async function InstructorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: viewerProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = viewerProfile?.role === "admin";

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .eq("role", "instructor")
    .single();

  if (!profile) notFound();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, profiles(*), lessons(count), enrollments(count)")
    .eq("instructor_id", params.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "I";

  const totalStudents = (courses ?? []).reduce(
    (acc: number, c: { enrollments: { count: number }[] }) =>
      acc + (c.enrollments?.[0]?.count ?? 0),
    0
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-border/40">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/[0.06] blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border/50 ring-offset-2 ring-offset-background">
              <AvatarImage src={profile.avatar_url ?? ""} />
              <AvatarFallback className="text-xl font-black bg-brand/10 text-brand">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-brand mb-1">
                Instructor
              </p>
              <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">
                {profile.full_name}
              </h1>
              {profile.bio && (
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-5 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-brand/70" />
                  <span className="font-semibold text-foreground">{courses?.length ?? 0}</span>
                  <span>{(courses?.length ?? 0) === 1 ? "course" : "courses"}</span>
                </div>
                {totalStudents > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-brand/70" />
                    <span className="font-semibold text-foreground">{totalStudents.toLocaleString()}</span>
                    <span>{totalStudents === 1 ? "student" : "students"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses grid */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold tracking-tight mb-6">
          Courses by {profile.full_name?.split(" ")[0]}
        </h2>

        {courses && courses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
              <BookOpen className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-semibold">No published courses yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back soon for new content from this instructor.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
