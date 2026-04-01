import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/navbar";
import {
  Lock,
  CheckCircle,
  Circle,
  ChevronLeft,
  ExternalLink,
  Unlock,
} from "lucide-react";
import { VideoPlayer } from "@/components/shared/video-player";
import { LessonTabs } from "@/components/shared/lesson-tabs";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";
import { LessonContent } from "@/components/shared/lesson-content";
import type { Lesson } from "@/types";

interface LessonFile { id: string; name: string; url: string; size?: number | null }

export const metadata = { title: "Learn" };

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function lessonTypeIcon(type: string) {
  switch (type) {
    case "text":  return "📄";
    case "link":  return "🔗";
    case "mixed": return "▶️";
    default:      return "▶️";
  }
}

export default async function LearnPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, progression_mode, lessons(*, lesson_files(*))")
    .eq("id", params.courseId)
    .single();

  if (!course) notFound();

  const lessons: (Lesson & { lesson_files: LessonFile[] })[] = (course.lessons ?? []).sort(
    (a: Lesson, b: Lesson) => a.position - b.position
  );

  const currentLesson = lessons.find((l) => l.id === params.lessonId);
  if (!currentLesson) notFound();

  // Auth + enrollment gate
  let isAdmin = false;
  let isEnrolled = false;
  let completedIds = new Set<string>();
  let unlockedIds = new Set<string>(); // for instructor_gated courses

  if (user) {
    const [{ data: profile }, { data: enrollment }, { data: progress }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("enrollments").select("id").eq("student_id", user.id).eq("course_id", params.courseId).single(),
      supabase.from("progress").select("lesson_id").eq("student_id", user.id).eq("course_id", params.courseId),
    ]);
    isAdmin = profile?.role === "admin";
    isEnrolled = isAdmin || !!enrollment;
    completedIds = new Set(progress?.map((p) => p.lesson_id) ?? []);

    // For instructor-gated courses, fetch which lessons are unlocked for this student
    if (isEnrolled && !isAdmin && course.progression_mode === "instructor_gated") {
      const { data: unlocks } = await supabase
        .from("lesson_unlocks")
        .select("lesson_id")
        .eq("student_id", user.id)
        .eq("course_id", params.courseId);
      unlockedIds = new Set(unlocks?.map((u) => u.lesson_id) ?? []);
    } else if (isAdmin || course.progression_mode === "self_paced") {
      // All lessons accessible
      unlockedIds = new Set(lessons.map((l) => l.id));
    }
  }

  // Access gate: free previews bypass login/enrollment
  if (!currentLesson.is_free_preview) {
    if (!user) redirect(`/login?next=/learn/${params.courseId}/${params.lessonId}`);
    if (!isEnrolled) redirect("/courses");
  }

  // Instructor-gated check (enrolled but lesson not yet unlocked)
  const isGated = course.progression_mode === "instructor_gated" && !isAdmin;
  const isLockedByInstructor = isGated && isEnrolled && !unlockedIds.has(currentLesson.id);

  const currentIdx = lessons.findIndex((l) => l.id === params.lessonId);
  const nextLesson = isEnrolled ? (lessons[currentIdx + 1] ?? null) : null;
  const isCompleted = completedIds.has(currentLesson.id);
  const completedCount = completedIds.size;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Sidebar lesson list
  const lessonList = (
    <nav className="flex-1 py-2">
      {lessons.map((lesson) => {
        const done = completedIds.has(lesson.id);
        const active = lesson.id === params.lessonId;
        const locked = isGated && isEnrolled && !unlockedIds.has(lesson.id) && !lesson.is_free_preview;

        return (
          <Link
            key={lesson.id}
            href={locked ? "#" : `/learn/${params.courseId}/${lesson.id}`}
            aria-disabled={locked}
            className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
              active
                ? "bg-zinc-800 text-zinc-100"
                : locked
                ? "text-zinc-600 cursor-not-allowed"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {locked ? (
                <Lock className="h-4 w-4 text-zinc-700" />
              ) : done ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Circle className={`h-4 w-4 ${active ? "text-zinc-300" : "text-zinc-600"}`} />
              )}
            </span>
            <span className="flex-1 leading-snug line-clamp-2">{lesson.title}</span>
            {lesson.duration_seconds ? (
              <span className="shrink-0 text-xs text-zinc-600 tabular-nums mt-0.5">
                {formatDuration(lesson.duration_seconds)}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarHeader = (
    <div className="p-4 border-b border-zinc-800">
      <Link
        href="/courses"
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
      >
        <ChevronLeft className="h-3 w-3" />
        All courses
      </Link>
      <h2 className="font-semibold text-sm text-zinc-100 leading-snug">{course.title}</h2>
      {isEnrolled && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span>{completedCount}/{lessons.length} completed</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-zinc-800 bg-zinc-950 lg:flex flex-col">
          {sidebarHeader}
          {lessonList}
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 lg:hidden">
            <MobileSidebar
              courseTitle={course.title}
              sidebarHeader={sidebarHeader}
              lessonList={lessonList}
            />
            <span className="text-sm font-medium truncate">{currentLesson.title}</span>
          </div>

          {/* Instructor-gated lock state */}
          {isLockedByInstructor ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="rounded-full bg-muted p-5 mb-5">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Lesson not yet unlocked</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your instructor hasn't unlocked this lesson for you yet. Check back later or reach out to them directly.
              </p>
            </div>
          ) : (
            <>
              {/* ── VIDEO / MIXED: video block ── */}
              {(currentLesson.lesson_type === "video" || currentLesson.lesson_type === "mixed") && (
                <div className="bg-black">
                  <div className="max-w-5xl mx-auto">
                    {currentLesson.mux_playback_id ? (
                      <VideoPlayer
                        playbackId={currentLesson.mux_playback_id}
                        lessonId={currentLesson.id}
                        courseId={params.courseId}
                        isCompleted={isCompleted}
                        isEnrolled={isEnrolled}
                        nextLessonId={nextLesson?.id ?? null}
                        nextCourseId={nextLesson ? params.courseId : null}
                      />
                    ) : (
                      <div className="aspect-video flex items-center justify-center gap-3 text-zinc-500">
                        <Lock className="h-6 w-6" />
                        <span className="text-sm">Video not yet available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── LINK: external resource card ── */}
              {currentLesson.lesson_type === "link" && currentLesson.external_url && (
                <div className="max-w-5xl mx-auto px-4 pt-8">
                  <a
                    href={currentLesson.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="rounded-lg bg-brand/10 p-3 shrink-0">
                        <ExternalLink className="h-5 w-5 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{currentLesson.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {currentLesson.external_url}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                  </a>
                </div>
              )}

              {/* ── Lesson info header ── */}
              <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Lesson {currentIdx + 1} of {lessons.length}
                      {!isEnrolled && currentLesson.is_free_preview && (
                        <span className="ml-2 text-brand font-medium">· Free preview</span>
                      )}
                    </p>
                    <h1 className="text-xl font-bold leading-snug">{currentLesson.title}</h1>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1.5 text-xs text-green-500 shrink-0 font-medium mt-1">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Enroll CTA for preview viewers */}
                {!isEnrolled && currentLesson.is_free_preview && (
                  <div className="mb-6 rounded-lg border border-brand/30 bg-brand/5 px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Enjoying this preview?</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enroll to unlock all lessons and track your progress.
                      </p>
                    </div>
                    <Link
                      href={`/courses/${params.courseId}`}
                      className="shrink-0 text-sm font-medium text-brand hover:underline"
                    >
                      View course →
                    </Link>
                  </div>
                )}

                {/* ── TEXT / MIXED / LINK: markdown content ── */}
                {(currentLesson.lesson_type === "text" ||
                  currentLesson.lesson_type === "mixed" ||
                  currentLesson.lesson_type === "link") &&
                  currentLesson.content && (
                    <LessonContent content={currentLesson.content} />
                  )}

                {/* ── Standard tabs (description + files) ── */}
                {(currentLesson.lesson_type === "video" || currentLesson.lesson_type === "mixed") && (
                  <LessonTabs
                    description={currentLesson.description}
                    files={isEnrolled ? (currentLesson.lesson_files ?? []) : []}
                  />
                )}

                {/* ── Mark complete / next (non-video types, enrolled only) ── */}
                {isEnrolled &&
                  currentLesson.lesson_type !== "video" &&
                  currentLesson.lesson_type !== "mixed" && (
                    <VideoPlayer
                      playbackId=""
                      lessonId={currentLesson.id}
                      courseId={params.courseId}
                      isCompleted={isCompleted}
                      isEnrolled={isEnrolled}
                      nextLessonId={nextLesson?.id ?? null}
                      nextCourseId={nextLesson ? params.courseId : null}
                      controlsOnly
                    />
                  )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
