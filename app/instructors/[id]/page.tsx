import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { CourseCard } from "@/components/shared/course-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Instructor header */}
        <div className="mb-12 flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left sm:items-start">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <Badge variant="secondary">Instructor</Badge>
            </div>
            {profile.bio && (
              <p className="text-muted-foreground max-w-xl mt-2">{profile.bio}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {courses?.length ?? 0} published courses
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">Courses by {profile.full_name}</h2>
        {courses && courses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No published courses yet.</p>
        )}
      </main>
    </div>
  );
}
