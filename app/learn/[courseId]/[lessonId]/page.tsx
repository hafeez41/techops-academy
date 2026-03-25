import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, CheckCircle, Circle } from "lucide-react";
import { VideoPlayer } from "@/components/shared/video-player";
import type { Lesson } from "@/types";

export const metadata = { title: "Learn" };

export default async function LearnPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Admins bypass enrollment check
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", params.courseId)
      .single();
    if (!enrollment) redirect(`/courses`);
  }

  // Fetch course + lessons
  const { data: course } = await supabase
    .from("courses")
    .select("*, lessons(*)")
    .eq("id", params.courseId)
    .single();
  if (!course) notFound();

  const lessons: Lesson[] = (course.lessons ?? []).sort(
    (a: Lesson, b: Lesson) => a.position - b.position
  );

  const currentLesson = lessons.find((l) => l.id === params.lessonId);
  if (!currentLesson) notFound();

  // Fetch progress
  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id")
    .eq("student_id", user.id)
    .eq("course_id", params.courseId);

  const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? []);
  const currentIdx = lessons.findIndex((l) => l.id === params.lessonId);
  const nextLesson = lessons[currentIdx + 1] ?? null;
  const isCompleted = completedIds.has(currentLesson.id);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-border lg:flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm truncate">{course.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {completedIds.size}/{lessons.length} completed
            </p>
          </div>
          <nav className="flex-1 p-2">
            {lessons.map((lesson, idx) => {
              const done = completedIds.has(lesson.id);
              const active = lesson.id === params.lessonId;
              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${params.courseId}/${lesson.id}`}
                  className={`flex items-start gap-3 rounded-md px-3 py-2.5 text-sm transition-colors mb-1 ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </span>
                  <span className="leading-snug line-clamp-2">{lesson.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main video area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Video */}
            {currentLesson.mux_playback_id ? (
              <VideoPlayer
                playbackId={currentLesson.mux_playback_id}
                lessonId={currentLesson.id}
                courseId={params.courseId}
                isCompleted={isCompleted}
                nextLessonId={nextLesson?.id ?? null}
                nextCourseId={nextLesson ? params.courseId : null}
              />
            ) : (
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Video not yet available</p>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold">{currentLesson.title}</h1>
                  {currentLesson.description && (
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {currentLesson.description}
                    </p>
                  )}
                </div>
                {isCompleted && (
                  <Badge variant="secondary" className="shrink-0">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
