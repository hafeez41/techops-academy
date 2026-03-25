import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play } from "lucide-react";
import type { Enrollment, Lesson } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "instructor") redirect("/instructor");

  // Enrolled courses with lessons
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*, lessons(*))")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  // Progress data
  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id, course_id")
    .eq("student_id", user.id);

  const completedLessonIds = new Set(progress?.map((p) => p.lesson_id) ?? []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {enrollments?.length ?? 0} enrolled courses
          </p>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment: Enrollment & { courses: { id: string; title: string; thumbnail_url: string | null; lessons: Lesson[] } }) => {
              const course = enrollment.courses;
              if (!course) return null;
              const lessons: Lesson[] = course.lessons ?? [];
              const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
              const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

              // Find last completed or first lesson
              const sortedLessons = [...lessons].sort((a, b) => a.position - b.position);
              const nextLesson =
                sortedLessons.find((l) => !completedLessonIds.has(l.id)) ?? sortedLessons[0];

              return (
                <Card key={enrollment.id} className="overflow-hidden flex flex-col">
                  <div className="relative aspect-video bg-muted">
                    {course.thumbnail_url ? (
                      <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {pct === 100 && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Badge>Completed</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold leading-snug line-clamp-2">{course.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{completed}/{lessons.length} lessons</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <Button size="sm" className="w-full mt-auto" asChild>
                      <Link href={nextLesson ? `/learn/${course.id}/${nextLesson.id}` : `/courses`}>
                        <Play className="mr-2 h-3.5 w-3.5" />
                        {pct === 0 ? "Start" : pct === 100 ? "Review" : "Resume"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold">No courses yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Browse courses to get started</p>
            <Button className="mt-6" asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
